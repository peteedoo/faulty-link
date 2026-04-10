# DESCRIPTION: Reverse video and audio playback
# USAGE: i360 reverse [--speed <multiplier>] [--fast] [--no-audio] [-o <output>] <input>

plugin_reverse() {
  local input="" output="" speed="" fast=false no_audio=false

  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -o)          output="$2"; shift 2 ;;
      --speed)     speed="$2"; shift 2 ;;
      --fast)      fast=true; shift ;;
      --no-audio)  no_audio=true; shift ;;
      -*)          i360_err "Unknown option: $1"; exit 1 ;;
      *)           input="$1"; shift ;;
    esac
  done

  if [[ -z "$input" ]]; then
    i360_err "Usage: i360 reverse [--speed <multiplier>] [-o <output>] <input>"
    exit 1
  fi

  validate_input "$input"

  # Build output name
  local suffix="reversed"
  [[ -n "$speed" ]] && suffix="reversed_${speed}x"
  [[ -z "$output" ]] && output="$(default_output "$input" "$suffix")"

  # Build FFmpeg filter args
  local vfilter="reverse"
  local afilter="areverse"

  if [[ -n "$speed" ]]; then
    local pts_mult
    pts_mult=$(echo "scale=6; 1.0 / $speed" | bc)
    vfilter="reverse,setpts=${pts_mult}*PTS"
    local atempo_chain
    atempo_chain="$(build_atempo "$speed")"
    afilter="areverse,${atempo_chain}"
  fi

  local preset="medium"
  $fast && preset="ultrafast"

  local args=()
  args+=(-vf "$vfilter")

  if $no_audio; then
    args+=(-an)
  else
    args+=(-af "$afilter")
  fi

  args+=(-c:v libx264 -preset "$preset" -crf 18)

  i360_log "${BOLD}Reversing${RESET} $(basename "$input")${speed:+ at ${speed}x}"
  run_ffmpeg "$input" "$output" "${args[@]}"
}
