var nconf = require("nconf");
var config = require("./config");
var cli = require("./3scale-cli-onprem");
var slug = require("slug");
var Q = require("q");
var request = Q.denodeify(require("request"));
var HttpError = require('http-error-constructor');



process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";



exports.createService = function(name){
    var url = config.API+"/services.json";
    var options ={
      method:'POST',
      url: url,
      form:{
        "access_token": config.access_token,
        "name": name,
        "system_name": slug(name,"_")
      }
    };
    var response = request(options);

    return response.then(function (r) {
     var res  = r[0].req.res;
     try {
       var body = JSON.parse(res.body);
       console.log(body)
     } catch(e) {
     }
      if (res.statusCode >= 300) {
        cli.error({message:"ERROR encountered: " + JSON.stringify(body.errors || body.status)});
        cli.debug({name: '3scale-cli:activedocs:delete', msg: 'ERROR:' +r[0].statusCode+" %o", data: (body.errors || body.status)})
        throw new Error("Server responded with status code " + r[0].statusCode + " "+JSON.stringify(body.error || body.status));
      } else {
        config.add("threescale:service_id",body.service.id);
        return body.service;//assuming tapes are strings and not binary data
      }
    });

};

exports.listServices = function (){
  var url = config.API+"/services.json";
  
  var options ={
    method:'GET',
    url: url,
    form:{
      "access_token": config.access_token
    },
    timeout:20000
  };

  
  var response = request(options);
  
  return response.then(function (r) {
    var res  = r[0].req.res;
    var body = JSON.parse(res.body);
    
    //console.log("services:"+res.body)
    
    if (res.statusCode >= 300) {
      cli.error({message:"ERROR encountered: " + JSON.stringify(body.error || body.status)});
      throw new Error("Server responded with status code " + r[0].statusCode + " "+JSON.stringify(body.error || body.status));
    } else {
      return body.services;
    }
  }).catch(function (err) {
      return err
  });
}

exports.getServiceByID = function(service_id){
  var url = config.API+"/services/"+service_id+".json";
  var options ={
    method:'GET',
    url: url,
    form:{
      "access_token": config.access_token,
      "id": service_id
    }
  };
  var response = request(options);
  return response.then(function (r) {
    var res  = r[0].req.res;
    var body = JSON.parse(res.body);
    if (res.statusCode >= 300) {
      cli.error({message:"ERROR encountered: " + JSON.stringify(body.error || body.status)});
      throw new Error("Server responded with status code " + r[0].statusCode + " "+JSON.stringify(body.error || body.status));
    } else {
      return body.service;
    }
  });
}

exports.updateService = function(service_id, name){
  var url = config.API+"/services/"+service_id+".json";
  var options ={
    method:'PUT',
    url: url,
    form:{
      "access_token": config.access_token,
      "id": service_id,
    }
  };

  if(name)
    options.form["name"]=name

  var response = request(options);
  return response.then(function (r) {
    var res  = r[0].req.res;
    var body = JSON.parse(res.body);
    if (res.statusCode >= 300) {
      cli.error({message:"ERROR encountered: " + JSON.stringify(body.error || body.status)});
      throw new Error("Server responded with status code " + r[0].statusCode + " "+JSON.stringify(body.error || body.status));
    } else {
      return body.service;
    }
  });
}

exports.deleteService = function(service_id) {
  var url = config.API+"/services/"+service_id+".json";
  var options ={
    method:'DELETE',
    url: url,
    form:{
      "access_token": config.access_token,
      "id": service_id,
    }
  };

  var response = request(options);
  return response.then(function (r) {
    var res  = r[0].req.res;
    var body = JSON.parse(res.body);
    if (res.statusCode >= 300) {
      cli.error({message:"ERROR encountered: " + JSON.stringify(body.error || body.status)});
      throw new Error("Server responded with status code " + r[0].statusCode + " "+JSON.stringify(body.error || body.status));
    } else {
      return body;
    }
  });
}
