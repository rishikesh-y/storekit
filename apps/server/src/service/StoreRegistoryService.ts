/**
 * For getting the tittle of the dapp store
 * Returns the store title
 *
 * returns String
 **/
exports.getStoreTitle = function() {
  return new Promise<void>(function(resolve, reject) {
    var examples:any = {};
    examples['application/json'] = "";
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

