node ./a.js

if [ "$?" == "1" ]; then
  node ./b.js
fi