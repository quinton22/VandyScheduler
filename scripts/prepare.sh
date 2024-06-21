#!/usr/bin/env bash

VS_TMP=$TMP_DIR/VandyScheduler

print() {
  echo "$1" >&2
}

validateVersion() {
  access_token=$(curl -s "https://oauth2.googleapis.com/token" -d "client_secret=$CLIENT_SECRET&grant_type=refresh_token&refresh_token=$REFRESH_TOKEN&client_id=$CLIENT_ID" | jq -r '.access_token')
    
  v2=$(curl -s --location 'https://www.googleapis.com/chromewebstore/v1.1/items/'$EXTENSION_ID'?projection=DRAFT' --header "Authorization: Bearer $access_token" | jq -r '.crxVersion')

  local v1=$1
  v1=${v1#v}

  if [[ "$v2" != "$(echo -e "$v2\n$v1" | sort -V | head -n1)" ]]; then
    print "Current published version ($v2) is greater than next version ($v1), so cannot publish"
    exit 1
  fi
}

writeVersion() {
  local version=$1
  version=${version#v}

  jq ".version=\"$version\"" < manifest.json > tmp-manifest
  mv tmp-manifest manifest.json
}

build() {
  if [ ! $(command -v pnpm) ]; then
    print "pnpm not installed"
    exit 1
  fi
  pnpm build
}

getFiles() {
  local items=( $(jq -r '[ (.icons | map(.)), (.content_scripts[] | [.js, .css, .html] | flatten | map(select(. != null))), (.background.service_worker), (.web_accessible_resources[] | [.resources] | flatten | map(select(. != null))) ] | flatten | @sh' < manifest.json | xargs echo) )

  items=( $(for item in ${items[@]}; do echo $item | sed 's/\/.*//'; done) )
  
  sort -u <<<"$(printf '%s\n' ${items[@]})"
}

copyFiles() {
  local files=( $( getFiles ) )
  mkdir $VS_TMP

  for file in ${files[@]}; do
    cp -r ./$file $VS_TMP/
  done

  cp ./manifest.json $VS_TMP/
}

createZip() {
  cd $VS_TMP
  zip -rq "../VandyScheduler.zip" *
  cd -
  mv "$TMP_DIR/VandyScheduler.zip" ./VandyScheduler.zip
}



main() {
  if [[ -z $1 ]]; then
    print "A version must be passed in"
    exit 1
  fi

  print "Validating version"
  validateVersion $1
  print "writing version"
  writeVersion $1

  print "build"
  build
  print "copy files"
  copyFiles
  print "create zip"
  createZip
}

main $@