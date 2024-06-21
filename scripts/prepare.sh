
VS_TMP=$TMP_DIR/VandyScheduler/


validateVersion() {
  access_token=$(curl "https://oauth2.googleapis.com/token" -d "client_secret=$CLIENT_SECRET&grant_type=refresh_token&refresh_token=$REFRESH_TOKEN&client_id=$CLIENT_ID" | jq -r '.access_token')
    
  v2=$(curl --location 'https://www.googleapis.com/chromewebstore/v1.1/items/'$EXTENSION_ID'?projection=DRAFT' --header "Authorization: Bearer $access_token" | jq -r '.crxVersion')

  local v1=$1
  v1=${v1#v}

  [ "$v2" = "$(echo -e "$v2\n$v1" | sort -V | head -n1)" ] || ( echo "Current published version ($v2) is greater than next version ($v1), so cannot publish"; exit 1 )
}

writeVersion() {
  local version=$1
  version=${version#v}

  jq ".version=\"$version\"" < manifest.json > manifest.json
}

build() {
  command -v pnpm || ( echo "pnpm not installed" >&2; exit 1 )
  pnpm build
}

getFiles() {
  local items=( $(jq -r '[ (.icons | map(.)), (.content_scripts[] | [.js, .css, .html] | flatten | map(select(. != null))), (.background.service_worker), (.web_accessible_resources[] | [.resources] | flatten | map(select(. != null))) ] | flatten | @sh' < manifest.json | xargs echo) )

  items=( $(for item in ${items[@]}; do echo $item | sed 's/\/.*//'; done) )
  
  sort -u <<<"$(printf '%s\n' ${items[@]})"
}

copyFiles() {
  local files=( "$( getFiles )" )
  mkdir $VS_TMP
  cp -r ./{$(IFS=,; echo "${files[*]}"),manifest.json} $VS_TMP
}

createZip() {
  cd $VS_TMP
  zip -rq "$VS_TMP/VandyScheduler.zip" *
  cd -
}

main() {
  validateVersion $1
  writeVersion $1

  build
  copyFiles
  createZip
}

main $@