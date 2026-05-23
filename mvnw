#!/bin/sh
# Maven Wrapper script
# Downloads and runs Maven automatically

set -e

MAVEN_HOME="${HOME}/.m2/wrapper/dists/apache-maven-3.9.9"
MAVEN_URL="https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip"

if [ ! -f "${MAVEN_HOME}/bin/mvn" ]; then
    echo "Downloading Maven 3.9.9..."
    mkdir -p "${MAVEN_HOME}"
    TMPFILE=$(mktemp /tmp/maven-XXXXXX.zip)
    curl -L -o "${TMPFILE}" "${MAVEN_URL}" || wget -O "${TMPFILE}" "${MAVEN_URL}"
    unzip -q -o "${TMPFILE}" -d "${HOME}/.m2/wrapper/dists/"
    rm -f "${TMPFILE}"
    echo "Maven installed to ${MAVEN_HOME}"
fi

export PATH="${MAVEN_HOME}/bin:${PATH}"
exec mvn "$@"
