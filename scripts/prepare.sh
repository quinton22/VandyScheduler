
VS_TEMP=/tmp/VandyScheduler/

writeVersion() {
  local version=$1
  version=${version#v}

  jq ".version=\"$version\"" < manifest.json > manifest.json
}

install() {
  command -v pnpm || ( echo "pnpm not installed" >&2; exit 1 )
  pnpm install
  pnpm build
}

getFiles() {
  local items=( $(jq -r '[ (.icons | map(.)), (.content_scripts[] | [.js, .css, .html] | flatten | map(select(. != null))), (.background.service_worker), (.web_accessible_resources[] | [.resources] | flatten | map(select(. != null))) ] | flatten | @sh' < manifest.json | xargs echo) )

  items=( $(for item in ${items[@]}; do echo $item | sed 's/\/.*//'; done) )
  
  sort -u <<<"$(printf '%s\n' ${items[@]})"
}

copyFiles() {
  local files=( "$( getFiles )" )
  mkdir /tmp/VandyScheduler
  cp -r ./{$(IFS=,; echo "${files[*]}"),manifest.json} $VS_TEMP
}

createZip() {
  local cwd=$( pwd )
  cd $VS_TEMP
  zip -rq "$cwd/VandyScheduler.zip" *
  cd $cwd
}

main() {
  writeVersion $1

  install
  copyFiles
  createZip
  echo "$( pwd )/VandyScheduler.zip"
}

main $@