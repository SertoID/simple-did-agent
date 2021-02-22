FROM node:15
RUN npm install @veramo/cli -g
RUN npm install veramo-plugin-did-config -g
RUN npm install sqlite3 --save -g
RUN veramo config create
RUN veramo execute -m didManagerCreate -a '{ "alias": "My Agent" }'
RUN veramo did list | grep -Po '\Kdid:ethr:rinkeby:[^ ]+' > did.txt
RUN cat did.txt
RUN DID=`cat did.txt` && echo "${DID}"
ARG DOMAIN
RUN find / -name "veramo.js"
RUN ls -la /usr/local/lib/node_modules/@veramo/cli
RUN cp -fR /usr/local/lib/node_modules/veramo-plugin-did-config/build/* /usr/local/lib/node_modules/@veramo/cli/build 
RUN DID=`cat did.txt` && echo "{ \"dids\":[  \"${DID}\" ],  \"domain\": \"${DOMAIN}\" }"  
RUN DID=`cat did.txt` && veramo execute -m generateDidConfiguration -a "{ \"dids\":[ \"did:ethr:rinkeby:0x0e623aa31d5e7f67388f453d4ccd5db8d12696e5\" ], \"domain\": \"${DOMAIN}\" }"
CMD [ "veramo", "server" ]