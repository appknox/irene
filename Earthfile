VERSION 0.6

ARG EARTHLY_GIT_BRANCH
ARG EARTHLY_GIT_SHORT_HASH
ARG TAG="$EARTHLY_GIT_BRANCH"_"$EARTHLY_GIT_SHORT_HASH"
ARG CONTAINER="ghcr.io/appknox/irene"

docker:
    FROM DOCKERFILE .
    SAVE IMAGE irene:"$TAG"

publish:
    FROM DOCKERFILE .
    FROM +docker
    SAVE IMAGE --push "$CONTAINER":"$TAG"
