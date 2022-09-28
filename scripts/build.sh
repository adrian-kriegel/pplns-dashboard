
LINKED_PKGS=$(ls -l node_modules/* | egrep "^l")

if [ ! -z "$LINKED_PKGS" ] && [ "$1" == "production" ] && false; then

    echo "Please unlink the following packages before building."
    echo "$LINKED_PKGS"

    exit -1

fi

tsc --noEmit --skipLibCheck 

rm -rf ./tmp
mkdir tmp

rm -rf ./dist
mkdir dist

WEBPACK_MODE="production"

if [ $# -ge 2 ]
then
    WEBPACK_MODE="$2"
fi

echo $WEBPACK_MODE
echo $1

TARGET_ENV="$1" webpack --mode "$WEBPACK_MODE"

cd tmp

zip "../dist/bundle-$1.zip" ./*

cd ..
#rm -rf tmp