angular.module('grandbrag.services', [])

.factory('Camera', ['$q', function($q) {

  return {
    getPicture: function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    }
  }
}])

.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    var ref = new Firebase("https://flickering-heat-8657.firebaseio.com/");
    return $firebaseAuth(ref);
  }
])

.service('FirebaseProfileService', function($http){
  var ref = new Firebase("https://flickering-heat-8657.firebaseio.com/");
  var authData = ref.getAuth();
	var uid = authData.uid;
	var profileRef = ref.child("profiles").child(uid);

  this.updateProfileName = function(firstName,lastName){
		console.log(firstName);
		console.log(lastName);
      profileRef.update({
        name:firstName +" "+ lastName,
        firstName:firstName,
        lastName: lastName,
      });

  };

	this.updateProfilePic = function(picUrl){
		profileRef.update({pic:picUrl});
	};

})

.service('FirebaseGrandkidService', function($http){
	var ref = new Firebase("https://flickering-heat-8657.firebaseio.com/");
  var authData = ref.getAuth();
	// Enter Grandkid Record into dbProfile
	this.addGkid = function(data){
    var uid = authData.uid
    var gkidRef = ref.child("grandchildren"+"/"+uid);
    var gkidPush = gkidRef.push(data);
    var pushId = gkidPush.path.o.slice(2);
    gkidRef =  ref.child("grandchildren"+"/"+uid+"/"+pushId);
    data = {pushId:pushId}
    gkidRef.update(data);

	}

  this.removeGkid = function(data){
      console.log(data);
      var uid = authData.uid
      var gkidPostRef = ref.child("grandchildren"+"/"+uid+"/"+data);
      console.log(gkidPostRef);
      gkidPostRef.remove();
  }

})


.factory('MyStreamFactory', function($http){
	//var BASE_URL = "http://pookanooka:1337/api.randomuser.me";
	var ref = new Firebase("https://flickering-heat-8657.firebaseio.com/");

	//var items = [];

	return {
		GetFeed: function(){
			var authData = ref.getAuth();
			var uid = authData.uid;
			var streamRef = ref.child('streams').child(uid);

			streamRef.on('value', function(snap){
				return snap.val();
			})
			console.log(response);


			/*return $http.get(BASE_URL+'?results=10').then(function(response){
				items = response.data.results;
				return items;
			});*/
		}
		/*GetNewBrags: function(){
			return $http.get(BASE_URL+'?results=10').then(function(response){
				items = response.data.results;
				return items;
			});
		}*/
	}
})
.service('FirebaseMyStreamService', function($firebaseArray){
	var ref = new Firebase("https://flickering-heat-8657.firebaseio.com/");

	this.addBrag = function(brag, fileUp){
			// add the allowed readers to the list
			var authData = ref.getAuth();
			var uid = authData.uid;
			var streamRef = ref.child("streams").child(uid);
			var friendsRef = ref.child("friends").child(uid);
      var profileRef = ref.child("profiles").child(uid);
      var profile = $firebaseArray(profileRef);

      profile.$loaded().then(function(){
        var profileName = profile[3].$value;
        var profilePic = profile[4].$value;
        console.log(profile);
        console.log(uid);

        console.log('In mystream Service pic is' +fileUp);

        if(!fileUp){
          var addStream = streamRef.push({
            uid:uid,
            profilePic: profilePic,
            braggersName: profileName,
            grandchild:brag.grandchild,
            accompType: brag.accompType,
            bragTitle: brag.bragTitle,
            brag:brag.brag,
            bragPic: "img/Grandbragloginlogo.png",
            date:Firebase.ServerValue.TIMESTAMP
          })

          var friends = $firebaseArray(friendsRef);


          friends.$loaded().then(function(){
            if(friends != null){
              var friendLoader = [];
              for(i=0; i < friends.length; i++){
                friendLoader.push(friends[i].uid);
              }

              for(userId in friendLoader){
                console.log(friendLoader[0]);
                console.log(userId);
                streamRef = ref.child("streams").child(friendLoader[userId]);
                addStream = streamRef.push({
                  uid:uid,
                  profilePic: profilePic,
                  braggersName: profileName,
                  grandchild:brag.grandchild,
                  accompType: brag.accompType,
                  bragTitle: brag.bragTitle,
                  brag:brag.brag,
                  bragPic: "img/Grandbragloginlogo.png",
                  date:Firebase.ServerValue.TIMESTAMP
                })
              }
            }
          })
        }else{
          var addStream = streamRef.push({
            uid:uid,
            profilePic: profilePic,
            braggersName: profileName,
            grandchild:brag.grandchild,
            accompType: brag.accompType,
            bragTitle: brag.bragTitle,
            brag:brag.brag,
            bragPic: fileUp,
            date:Firebase.ServerValue.TIMESTAMP
          })

          var friends = $firebaseArray(friendsRef);


          friends.$loaded().then(function(){
            if(friends != null){
              var friendLoader = [];
              for(i=0; i < friends.length; i++){
                friendLoader.push(friends[i].uid);
              }

              for(userId in friendLoader){
                console.log(friendLoader[0]);
                console.log(userId);
                streamRef = ref.child("streams").child(friendLoader[userId]);
                addStream = streamRef.push({
                  uid:uid,
                  profilePic: profilePic,
                  braggersName: profileName,
                  grandchild:brag.grandchild,
                  accompType: brag.accompType,
                  bragTitle: brag.bragTitle,
                  brag:brag.brag,
                  bragPic: fileUp,
                  date:Firebase.ServerValue.TIMESTAMP
                })
              }
            }
          })
        }

      });
	}
})

.service('FirebaseFriendsService', function($http){
  var ref = new Firebase("https://flickering-heat-8657.firebaseio.com/");
  var authData = ref.getAuth();
  this.currentRequest;


  this.sendFriendRequest = function(userId){
    console.log(userId);
    var uid = authData.uid;
    requestRef = ref.child('friendRequests').child(userId);

    function makeRequest(){
      requestRef.orderByChild('uid').startAt(uid).endAt(uid).once('value', function(snap) {
           this.currentRequest = snap.val();
           console.log("currentRequest value is:", currentRequest);

           if(this.currentRequest != null){
             return false;
           }else{
             var requestPush = requestRef.push(uid);
             var pushId = requestPush.path.o.slice(2);
						 console.log(pushId);
             console.log(pushId[0]);
             requestRef =  ref.child('friendRequests').child(userId).child(pushId[0]);
             var profileRef = ref.child('profiles').child(uid);

             profileRef.on('value',function(snap){
               var profile = snap.val()
               console.log(profile);

               data = {
                 pushId:pushId[0],
                 firstName:profile.firstName,
                 lastName: profile.lastName,
                 pic:profile.pic,
                 uid:uid
               }
               requestRef.update(data);
             })


             var hasRequestRef = ref.child('hasRequested').child(uid);
             var hasRequestPush = hasRequestRef.push(userId);
             pushId = hasRequestPush.path.o.slice(2);
             console.log(pushId[0]);
             hasRequestRef =  ref.child('hasRequested').child(uid).child(pushId[0]);
             data = {
               pushId:pushId,
               userId:userId
             }
             hasRequestRef.update(data);

             this.currentRequest = null;
           };
         })

   }

  makeRequest();

  };

  this.removeFriendRequest = function(userId){
    var uid = authData.uid;
    var hasRequestRef = ref.child('hasRequested').child(uid);
    var friendRequestRef = ref.child('friendRequests').child(userId);
    var requestListRef = ref.child('requestList').child(uid).child('requestList');

    hasRequestRef.orderByChild('userId').startAt(userId).endAt(userId).once('value', function(snap) {
        var response = snap.forEach(function(childSnapshot){
           var key = childSnapshot.key();
           console.log(key);
           hasRequestRef = ref.child('hasRequested').child(uid).child(key);
           hasRequestRef.remove();
        })
    })

    friendRequestRef.orderByChild('uid').startAt(uid).endAt(uid).once('value', function(snap) {
        var response = snap.forEach(function(childSnapshot){
           var key = childSnapshot.key();
           console.log(key);
           friendRequestRef = ref.child('friendRequests').child(userId).child(key);
           friendRequestRef.remove();
        })
    })

    requestListRef.on('value', function(snap){
      var response = snap.forEach(function(childSnapshot){
        var key = childSnapshot.key();
        var value = childSnapshot.val();

        if(value == userId){
          requestListRef = ref.child('requestList').child(uid).child('requestList').child(key);
          console.log(key,value);
          requestListRef.remove();
        }
      })
    })

  }

	this.denyFriendRequest = function(userId){
		console.log(userId);
		var uid = authData.uid;
		var denyRef = ref.child('friendRequests').child(uid);
		denyRef.orderByChild('uid').startAt(userId).endAt(userId).once('value',function(snap){
				console.log(snap.val());
			var response = snap.forEach(function(childSnapshot){
				var key = childSnapshot.key();
        var value = childSnapshot.val();
				console.log(key);
				denyRef = ref.child('friendRequests').child(uid).child(key);
				denyRef.remove();
			})
		})

	}

	this.acceptFriendRequest = function(userId){
		console.log(userId);
		var uid = authData.uid;
		var acceptRef = ref.child('friendRequests').child(uid);
		var senderFriendRef = ref.child('friends').child(userId);
		var recieverFriendRef = ref.child('friends').child(uid);

		acceptRef.orderByChild('uid').startAt(userId).endAt(userId).once('value',function(snap){
			console.log(snap.val());
			var response = snap.forEach(function(childSnapshot){
				var key = childSnapshot.key();
				var value = childSnapshot.val();
				console.log(key);
				console.log(value);
				recieverFriendRef.push(value)

				var profileRef = ref.child('profiles').child(uid);
				profileRef.on('value',function(snap){
					var profile = snap.val()
					console.log(profile);
					senderFriendRef.push({
						name:profile.name,
						pic:profile.pic,
						uid:profile.uid
					})
				})
				acceptRef = ref.child('friendRequests').child(uid).child(key);
				acceptRef.remove();
			})
		})



	}

	this.removeFriend = function(userId){

		console.log(userId);

		var uid = authData.uid;
		var userRemoveRef = ref.child('friends').child(uid);
		var friendRemoveRef = ref.child('friends').child(userId);

		userRemoveRef.orderByChild('uid').startAt(userId).endAt(userId).once('value',function(snap){
				console.log(snap.val());
			var response = snap.forEach(function(childSnapshot){
				var key = childSnapshot.key();
				var value = childSnapshot.val();
				console.log(key);
				userRemoveRef = ref.child('friends').child(uid).child(key);
				userRemoveRef.remove();
			})
		})

		friendRemoveRef.orderByChild('uid').startAt(uid).endAt(uid).once('value',function(snap){
				console.log(snap.val());
			var response = snap.forEach(function(childSnapshot){
				var key = childSnapshot.key();
				var value = childSnapshot.val();
				console.log(key);
				friendRemoveRef = ref.child('friends').child(userId).child(key);
				friendRemoveRef.remove();
			})
		})
	}
})




.service('IonicUserStartupService', function(){
  var ref = new Firebase("https://flickering-heat-8657.firebaseio.com/");
  var authData = ref.getAuth();
  var uid = authData.uid;
  var profileRef = ref.child('profiles').child(uid);
  var friendsRef = ref.child('friends').child(uid);
  var friendReqRef = ref.child('friendRequests').child(uid);
  var myStreamRef = ref.child('streams').child(uid);
  var ionicUserDataRef = ref.child('ionic').child(uid);



  this.getData = function(){

    profileRef.on('value', function(snap){
        var profile = snap.val();

        ionicUserDataRef.set({
          email:profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          name: profile.name,
          pic:profile.pic,
          uid: profile.uid
        })
    })

    // Get and update Friends Data to Firebase
    var friendCount = 0;
    friendsRef.on('value', function(snap){
      var friends = snap.val();
      console.log(friends);

          for(key in friends){
            friendCount += 1;
          }

      console.log(friendCount);
      friendCount = friendCount.toString();
      ionicUserDataRef.update({friends:friendCount});
    })

    // Get and update Friend Request Data to Firebase
    var friendReqCount = 0;
    friendReqRef.on('value', function(snap){
          var friendReq = snap.val();
          for(key in friendReq){
            friendReqCount += 1;
          }

      friendReqCount = friendReqCount.toString();
      ionicUserDataRef.update({friendRequests: friendReqCount});
    })

    // Get and update Stream Count Data to Firebase
    var streamCount = 0;
    myStreamRef.on('value', function(snap){
      myStream = snap.val();
      for(key in myStream){
        streamCount += 1;
      }

      streamCount = streamCount.toString();
      ionicUserDataRef.update({totalStreamCount: streamCount});
    })
  }



  this.sendData = function(){

    angular.element(document).ready(function(){
      // kick off the platform web client
      Ionic.io();

      // this will give you a fresh user or the previously saved 'current user'
      var user = Ionic.User.current();
    //  user.id = uid;
      console.log(user.id);
      console.log(uid);

      // if the user doesn't have an id, you'll need to give it one.
      if (!user.id || user.id != uid) {
        user.id = uid;
        console.log(user.id);
        console.log(uid);

      }

      user.save();

      var success = function(loadedUser) {
        // if this user should be treated as the current user,
        // you will need to set it as such:
        Ionic.User.current(loadedUser);

        // assuming you previous had var user = Ionic.User.current()
        // you will need to update your variable reference
        user = Ionic.User.current();

        ionicUserDataRef.on('value', function(snap){
          var profile = snap.val();

          user.set('email', profile.email);
          user.set('firstName', profile.firstName);
          user.set('lastName', profile.lastName);
          user.set('name', profile.name);
          user.set('image', profile.pic);
          user.set('totalStreamCount', profile.totalStreamCount);
          user.set('friendRequests', profile.friendRequests);
          user.set('friends', profile.friends);

          user.save();
        })

      };

      var failure = function(error) {
        console.log('something went wrong');
      };

     //Ionic.User.load(uid).then(success, failure);
    })


  }


})
