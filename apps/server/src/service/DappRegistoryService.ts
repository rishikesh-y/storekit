import {Dapp} from '@merokudao/dapp-store-registry';
/**
 * For listing new Dapp to the store
 * lists the new dapp to the store
 *
 * body Dapp Send the request with dapp schema parameters
 * returns Dapp
 **/
exports.addDapp = function(body:Dapp) {
  return new Promise<void>(function(resolve, reject) {
    var examples:any = {};
    examples['application/json'] = {
  "repoUrl" : "http://example.com/aeiou",
  "isMatureForAudience" : true,
  "listDate" : "2000-01-23",
  "images" : {
    "logo" : "",
    "banner" : "",
    "screenshots" : [ "", "" ]
  },
  "chains" : [ 6, 6 ],
  "dappId" : "dappId",
  "description" : "Description of Dapp",
  "geoRestrictions" : {
    "blockedCountries" : [ "blockedCountries", "blockedCountries" ],
    "allowedCountries" : [ "allowedCountries", "allowedCountries" ]
  },
  "language" : "language",
  "version" : "version",
  "availableOnPlatform" : [ "ios", "ios" ],
  "isSelfModerated" : true,
  "tags" : [ "tags", "tags" ],
  "isListed" : true,
  "minAge" : 0,
  "name" : "Dapp Name",
  "developer" : {
    "legalName" : "legalName",
    "website" : "website",
    "githubId" : "githubId",
    "logo" : "logo",
    "privacyPolicyUrl" : "privacyPolicyUrl",
    "support" : {
      "url" : "http://example.com/aeiou",
      "email" : ""
    }
  },
  "category" : "books"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * For deleteing the dapp in the store
 * Removes the dapp with particular id from the store
 *
 * email String Developer email to check the authenticity of request
 * dappId String Dapp id
 * no response value expected for this operation
 **/
exports.deleteDapp = function(email:string,dappId:string) {
  return new Promise<void>(function(resolve, reject) {
    resolve();
  });
}


/**
 * For searching the dapp in the store
 * User can search dapp by input string along with choosing either one or more filter options
 *
 * query String Search string parameter
 * search search filter options (optional)
 * returns List
 **/
exports.getDapps = function(query:string,search:any) {
  return new Promise<void>(function(resolve, reject) {
    var examples:any = {};
    examples['application/json'] = [ {
  "repoUrl" : "http://example.com/aeiou",
  "isMatureForAudience" : true,
  "listDate" : "2000-01-23",
  "images" : {
    "logo" : "",
    "banner" : "",
    "screenshots" : [ "", "" ]
  },
  "chains" : [ 6, 6 ],
  "dappId" : "dappId",
  "description" : "Description of Dapp",
  "geoRestrictions" : {
    "blockedCountries" : [ "blockedCountries", "blockedCountries" ],
    "allowedCountries" : [ "allowedCountries", "allowedCountries" ]
  },
  "language" : "language",
  "version" : "version",
  "availableOnPlatform" : [ "ios", "ios" ],
  "isSelfModerated" : true,
  "tags" : [ "tags", "tags" ],
  "isListed" : true,
  "minAge" : 0,
  "name" : "Dapp Name",
  "developer" : {
    "legalName" : "legalName",
    "website" : "website",
    "githubId" : "githubId",
    "logo" : "logo",
    "privacyPolicyUrl" : "privacyPolicyUrl",
    "support" : {
      "url" : "http://example.com/aeiou",
      "email" : ""
    }
  },
  "category" : "books"
}, {
  "repoUrl" : "http://example.com/aeiou",
  "isMatureForAudience" : true,
  "listDate" : "2000-01-23",
  "images" : {
    "logo" : "",
    "banner" : "",
    "screenshots" : [ "", "" ]
  },
  "chains" : [ 6, 6 ],
  "dappId" : "dappId",
  "description" : "Description of Dapp",
  "geoRestrictions" : {
    "blockedCountries" : [ "blockedCountries", "blockedCountries" ],
    "allowedCountries" : [ "allowedCountries", "allowedCountries" ]
  },
  "language" : "language",
  "version" : "version",
  "availableOnPlatform" : [ "ios", "ios" ],
  "isSelfModerated" : true,
  "tags" : [ "tags", "tags" ],
  "isListed" : true,
  "minAge" : 0,
  "name" : "Dapp Name",
  "developer" : {
    "legalName" : "legalName",
    "website" : "website",
    "githubId" : "githubId",
    "logo" : "logo",
    "privacyPolicyUrl" : "privacyPolicyUrl",
    "support" : {
      "url" : "http://example.com/aeiou",
      "email" : ""
    }
  },
  "category" : "books"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * For finding the details of featured dapps
 * returns all featured dapps
 *
 * returns List
 **/
exports.getFeaturedDapps = function() {
  return new Promise<void>(function(resolve, reject) {
    var examples:any = {};
    examples['application/json'] = [ {
  "repoUrl" : "http://example.com/aeiou",
  "isMatureForAudience" : true,
  "listDate" : "2000-01-23",
  "images" : {
    "logo" : "",
    "banner" : "",
    "screenshots" : [ "", "" ]
  },
  "chains" : [ 6, 6 ],
  "dappId" : "dappId",
  "description" : "Description of Dapp",
  "geoRestrictions" : {
    "blockedCountries" : [ "blockedCountries", "blockedCountries" ],
    "allowedCountries" : [ "allowedCountries", "allowedCountries" ]
  },
  "language" : "language",
  "version" : "version",
  "availableOnPlatform" : [ "ios", "ios" ],
  "isSelfModerated" : true,
  "tags" : [ "tags", "tags" ],
  "isListed" : true,
  "minAge" : 0,
  "name" : "Dapp Name",
  "developer" : {
    "legalName" : "legalName",
    "website" : "website",
    "githubId" : "githubId",
    "logo" : "logo",
    "privacyPolicyUrl" : "privacyPolicyUrl",
    "support" : {
      "url" : "http://example.com/aeiou",
      "email" : ""
    }
  },
  "category" : "books"
}, {
  "repoUrl" : "http://example.com/aeiou",
  "isMatureForAudience" : true,
  "listDate" : "2000-01-23",
  "images" : {
    "logo" : "",
    "banner" : "",
    "screenshots" : [ "", "" ]
  },
  "chains" : [ 6, 6 ],
  "dappId" : "dappId",
  "description" : "Description of Dapp",
  "geoRestrictions" : {
    "blockedCountries" : [ "blockedCountries", "blockedCountries" ],
    "allowedCountries" : [ "allowedCountries", "allowedCountries" ]
  },
  "language" : "language",
  "version" : "version",
  "availableOnPlatform" : [ "ios", "ios" ],
  "isSelfModerated" : true,
  "tags" : [ "tags", "tags" ],
  "isListed" : true,
  "minAge" : 0,
  "name" : "Dapp Name",
  "developer" : {
    "legalName" : "legalName",
    "website" : "website",
    "githubId" : "githubId",
    "logo" : "logo",
    "privacyPolicyUrl" : "privacyPolicyUrl",
    "support" : {
      "url" : "http://example.com/aeiou",
      "email" : ""
    }
  },
  "category" : "books"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * For updating the exisitng dapp
 * Updates the existing dapp
 *
 * body Dapp Send the request with the updated parameters
 * returns Dapp
 **/
exports.updateDapp = function(body:Dapp) {
  return new Promise<void>(function(resolve, reject) {
    var examples:any = {};
    examples['application/json'] = {
  "repoUrl" : "http://example.com/aeiou",
  "isMatureForAudience" : true,
  "listDate" : "2000-01-23",
  "images" : {
    "logo" : "",
    "banner" : "",
    "screenshots" : [ "", "" ]
  },
  "chains" : [ 6, 6 ],
  "dappId" : "dappId",
  "description" : "Description of Dapp",
  "geoRestrictions" : {
    "blockedCountries" : [ "blockedCountries", "blockedCountries" ],
    "allowedCountries" : [ "allowedCountries", "allowedCountries" ]
  },
  "language" : "language",
  "version" : "version",
  "availableOnPlatform" : [ "ios", "ios" ],
  "isSelfModerated" : true,
  "tags" : [ "tags", "tags" ],
  "isListed" : true,
  "minAge" : 0,
  "name" : "Dapp Name",
  "developer" : {
    "legalName" : "legalName",
    "website" : "website",
    "githubId" : "githubId",
    "logo" : "logo",
    "privacyPolicyUrl" : "privacyPolicyUrl",
    "support" : {
      "url" : "http://example.com/aeiou",
      "email" : ""
    }
  },
  "category" : "books"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

