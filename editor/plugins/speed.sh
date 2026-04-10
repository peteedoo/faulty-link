# DESCRIPTION: Change video playback speed (0.25x – 100x)
# USAGE: i360 speed <multiplier> [--fast] [--no-audio] [-o <output>] <input>

plugin_speed() {
  local input="" output="" speed="" fast=false no_audio=false

  # First positional arg is the speed multiplier
  if [[ $# -gt 0 && "$1" =~ ^[0-9]*\.?[0-9]+$ ]]; then
    speed="$1"
    shift
  fi

  # Parse remaining arguments
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -o)          output="$2"; shift 2 ;;
      --fast)      fast=true; shift ;;
      --no-audio)  no_audio=true; shift ;;
      -*)          i360_err "Unknown option: $1"; exit 1 ;;
      *)           input="$1"; shift ;;
    esac
  done

  if [[ -z "$speed" || -z "$input" ]]; then
    i360_err "Usage: i360 speed <multiplier> [-o <output>] <input>"
    echo "  Example: i360 speed 2 video.mp4      # 2x faster"
    echo "  Example: i360 speed 0.5 video.mp4    # half speed"
    exit 1
  fi

  # Validate speed range
  if (( $(echo "$speed <= 0" | bc -l) )); then
    i360_err "Speed must be greater than 0"
    exit 1
  fi
  if (( $(echo "$speed > 100" | bc -l) )); then
    i360_err "Speed must be 100 or less"
    exit 1
  fi
  if (( $(echo "$speed == 1" | bc -l) )); then
    i360_warn "Speed is 1x — nothing to do. Use a different value."
    exit 0
  fi

  validate_input "$input"

  # Build output name
  [[ -z "$output" ]] && output="$(default_output "$input" "${speed}x")"

  # Build filters
  local pts_mult
  pts_mult=$(echo "scale=6; 1.0 / $speed" | bc)
  local vfilter="setpts=${pts_mult}*PTS"
  local atempo_chain
  atempo_chain="$(build_atempo "$speed")"

  local preset="medium"
  $fast && preset="ultrafast"

  local args=()
  args+=(-vf "$vfilter")

  if $no_audio; then
    args+=(-an)
  else
    args+=(-af "$atempo_chain")
  fi

  args+=(-c:v libx264 -preset "$preset" -crf 18)

  local label="faster"
  (( $(echo "$speed < 1" | bc -l) )) && label="slower"
  i360_log "${BOLD}Speed ${speed}x${RESET} (${label}) — $(basename "$input")"
  run_ffmpeg "$input" "$output" "${args[@]}"
}
