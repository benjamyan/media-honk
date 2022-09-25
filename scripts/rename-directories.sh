#!/bin/bash

rex_glyph="(?!([a-z1234567890\s]))."
rex_end="(((\d{3,4})p)|(x\d{3})|([a-z]{1,3}3)|(((\s|\.)([a-z]+)rip)|hc|aac|axxo|xvid)|(\d{3,4}x\d{3,4})).*"

printf "START\n\n"
for f in *
do
  # new="${f// /_}"
  # if [ "$new" != "$f" ]
  echo "${f#(?!([a-z1234567890\s])).}"
  if [[ $f =~ (?!([a-z1234567890\s])). ]]
  then
    # echo $f;
    printf "$f\n----MATCHED\n\n";
    # if [ -e "$new" ]
    # then
    #   echo not renaming \""$f"\" because \""$new"\" already exists
    # else
    #   echo moving "$f" to "$new"
    # mv "$f" "${new,,}"
  # else 
  #   printf "nope!\n\n"
  fi
# fi
done
printf "\nEND\n\n"

# glyphs
# /(?!([a-z\d\s]))./gi || /(?!([a-z1234567890\s]))./gi

# uppercase
# /([A-Z])/g

# pattern match for end of words
# /(((\d{3,4})p)|(x\d{3})|([a-z]{1,3}3)|(((\s|\.)([a-z]+)rip)|hc|aac|axxo|xvid)|(\d{3,4}x\d{3,4})).*/gi
