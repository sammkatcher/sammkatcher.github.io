#!/bin/bash
# A script to automatically rename and compress all images in one folder into another

# Take pictures from, WARNING no spaces can be in the path name
FROM="./assets/gallery"
# Compress to
TO="./assets/gallery2"

checkDirectries(){
    if test -d $1; then
        echo $1: "Input Directory exists"
    else
        echo "Couldn't find input directory, exiting..."
        echo ""
        exit
    fi
    if test -d $2; then
        echo $2: "Output Directory exists, clearing it..."
        rm -rf $2
        mkdir  $2
        sleep 1
    else
        echo "Couldn't find output directory, exiting..."
        echo ""
        exit
    fi
}

# rename(){
#   cnt=1
#   for fname in $1/*
#   do
#     mv "$fname" "$2/$cnt.jpg"
#     cnt=$(( $cnt + 1 ))
#     echo "copying $fname to $2/$cnt.jpg..."
#   done
# }

compressFiles(){
  files=`ls $1 |  grep -iE ".*.(JPG|JPEG|jpg|jpeg)"`
  for file in $files; do
      echo Compressing "$1/$file" into "$2/$file" 
      # ffmpeg -y -i $1/$file -q:v 10 $2/$file -hide_banner -loglevel error
      #convert $1/$file -interlace plane $2/$file
      #jpegtran -copy none -progressive -outfile "$2/$file" "$1/$file" 
      ffmpeg -y -i "$1/$file" -q:v 10 "$2/$file" -loglevel error
      # convert -strip -interlace plane -quality 10 s_$file c_$file
  done
}

echo ""
checkDirectries $FROM $TO 
echo ""
# rename $FROM $FROM
compressFiles $FROM $TO
echo ""
echo "Done!"
echo ""