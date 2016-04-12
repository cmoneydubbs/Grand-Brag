angular.module('grandbrag.controllers', [])

.filter('capitalize', function() {
  return function(input, scope) {
    if (input!=null){
      input = input.toLowerCase();
      return input.substring(0,1).toUpperCase()+input.substring(1);
    }

  }
})

.controller("LoginCtrl", function($scope,Auth,$state,$ionicModal) {

  var ref = new Firebase("https://flickering-heat-8657.firebaseio.com/");

  $scope.createUser = function(signupCheck, signup) {
    console.log(signupCheck);

    if(signupCheck === true){
      $scope.closeModal();

      $scope.signupMessage = null;
      $scope.signupError = null;

      var firstName = signup.firstName.toLowerCase();
      var lastName = signup.lastName.toLowerCase();
      var email = signup.email.toLowerCase();


      Auth.$createUser({
        email:email,
        password: signup.password
      }).then(function(userData) {
        console.log(userData);
        $scope.message = "User created with uid: " + userData.uid;
        ref.child("users").child(userData.uid).set({
          provider:'password',
          email:email
        });


        ref.child("profiles").child(userData.uid).set({
          email: email,
          firstName: firstName,
          lastName: lastName,
          name: firstName +" "+lastName,
          pic:"img/Grandbragloginlogo.png",
          uid: userData.uid
        });
        $scope.signupMessage2 = "Profile Saved Successfully";
      }).catch(function(error) {
        $scope.signupError = error;
      });
    }



  };


  $ionicModal.fromTemplateUrl('my-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function() {
      $scope.modal.show();
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });




//login stuff
		$scope.login = function(){

      console.log($scope.email);
      console.log($scope.password);

			Auth.$authWithPassword({
				email: $scope.email,
				password: $scope.password
			}).then(function(authData) {
				console.log("Logged in as:", authData.uid);
				$state.go('menu.mystream');
			}).catch(function(error) {
				console.error("Authentication failed:", error);
			});

		}

  })

.controller('MenuCtrl', function($scope, $state, $window, $ionicHistory) {
	$scope.logout = function() {
		var ref = new Firebase("https://flickering-heat-8657.firebaseio.com/");
    ref.unauth();
    $window.localStorage.clear();
     $ionicHistory.clearCache();
     $ionicHistory.clearHistory();
	$state.go('login', {}, {reload: true});
};
})

.controller('MystreamCtrl', function(Camera,$cordovaCamera,$ionicModal, $scope, $timeout,FirebaseMyStreamService,MyStreamFactory,Auth,$firebaseArray) {
  $scope.items = [];
	$scope.show = [];
	var ref = new Firebase("https://flickering-heat-8657.firebaseio.com/");
	var authData = ref.getAuth();
	var uid = authData.uid;
	var streamRef = ref.child("streams").child(uid);
  var imageRef = ref.child("images").child(uid);
  var syncArray = $firebaseArray(imageRef);
	var query = streamRef.orderByChild("date");
	$scope.filteredBrags = $firebaseArray(query);
  var gkidRef = ref.child("grandchildren").child(uid);
  var gkids = $firebaseArray(gkidRef);

  gkids.$loaded().then(function(){
    $scope.gkidItems = gkids;
  });

  // image upload
 $scope.images = [];
  $scope.images = syncArray;

  $scope.upload = function() {
    file = $scope.fileUp;
    syncArray.$add({image: file}).then(function() {
        alert("Image has been uploaded to" );
    });
  }

// refresh
   $scope.doRefresh = function(){
     location.reload(true);
     $scope.$broadcast('scroll.refreshComplete');
   };

   $scope.loadMore = function() {
     $scope.filteredBrags.$loaded().then(function(brags) {
         // data is loaded here
        if($scope.filteredBrags.length >= 1){
          console.log($scope.filteredBrags.length + "are left in the FirebaseArray");
          for (var i = 0; i < 1; i++) {
            var x = $scope.filteredBrags.pop();
            $scope.show.push(x);
          }
        }else{
          //do something
        }

     });

		 $scope.$broadcast('scroll.infiniteScrollComplete');
   };

   $scope.moreDataCanBeLoaded = function() {
       return ($scope.filteredBrags.length >=0) ? true : false;
   }

   $scope.$on('$stateChangeSuccess', function() {
     $scope.loadMore();
   });


  $scope.getPhoto = function(options) {
    var options = {
     quality: 100,
     destinationType: Camera.DestinationType.DATA_URL,
     sourceType: Camera.PictureSourceType.CAMERA,
     allowEdit: true,
     encodingType: Camera.EncodingType.JPEG,
     saveToPhotoAlbum: false,
     correctOrientation:true
   };

   $cordovaCamera.getPicture(options).then(function(imageData) {
      $scope.fileUp = "data:image/jpeg;base64," + imageData;
      console.log($scope.fileUp);
   }, function(err) {
     // error
   });
  };



  $scope.bragCheck = function(bragCheck,brag){
    if(bragCheck){
      $scope.postBrag(brag);
      $scope.closeModal(1);
    }
  }

	//Post Brag
	$scope.null = {};
	$scope.entry = {};
  $scope.postBrag = function(brag) {

  	$scope.entry = angular.copy(brag);
    console.log('In post brag pic is' + $scope.fileUp);
  	FirebaseMyStreamService.addBrag($scope.entry,$scope.fileUp);
  	$scope.brag = angular.copy($scope.null);
  	console.log($scope.entry);

    setTimeout($scope.reset,3000);
  	//$scope.reset();
  };

  $scope.reset = function() {
    $scope.brag = angular.copy($scope.null);
    location.reload(true);
  };

  //modal stuff
    $ionicModal.fromTemplateUrl("my-modal.html", {
    id: '1',
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.oModal1 = modal;
  });

  //modal stuff
    $ionicModal.fromTemplateUrl("my-modal-2.html", {
    id: '2',
    scope: $scope,
    backdropClickToClose: true,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.oModal2 = modal;
  });

  $scope.openModal = function(index) {
    if(index == 1){
      $scope.oModal1.show();
    }else{

      if($scope.picLocation != "img/Grandbragloginlogo.png"){
        $scope.oModal2.show();
      }

    }

  };
  $scope.closeModal = function(index) {
    if(index == 1){
      $scope.oModal1.hide();
    }else{
      $scope.oModal2.hide();
    }
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.oModal1.remove();
    $scope.oModal2.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });

  //Image Modal image location stuff

  $scope.getPicLocation = function(picUrl,title){
    $scope.picLocation = picUrl;
    $scope.modalTitle = title;
  }

})



.controller('MyfriendsCtrl', function($scope, $state,FirebaseFriendsService,$window,$sce) {

	var ref = new Firebase("https://flickering-heat-8657.firebaseio.com/");
	var authData = ref.getAuth();
	var uid = authData.uid;
	var friendsRef = ref.child("friends").child(uid);

	//show friends
	friendsRef.on("value", function(snapshot){
		$scope.showFriends = snapshot.val();
	});

	//Remove friend
	$scope.removeFriend = function(userId){
		FirebaseFriendsService.removeFriend(userId);
	};

	//Friend Search Form
	$scope.null = {};
	$scope.entry = {};
	$scope.nameSearch = function(searchData) {

    var friend = searchData.toLowerCase();
    console.log(friend);

		if(!friend){
			$scope.noResults = "No name entered.";
			console.log('No name entered.');
		}else{
			$scope.noResults = "Friends Search Results:";
			$scope.entry = angular.copy(friend);
			//FirebaseFriendsService.queryStringSet($scope.entry);
			ref.child('profiles').orderByChild('name').startAt($scope.entry).endAt($scope.entry).once('value', function(snap) {
				$scope.$apply(function(){
          var friendResult = snap.val();
          console.log(friendResult);

          if(friendResult === null){
            $scope.noResults = 'Sorry, no results found.';
          }else{
            $scope.friendSearchResult = snap.val();
          }
				})
			});

			$scope.friend = angular.copy($scope.null);
			//console.log($scope.entry);
			$scope.reset();

			//$window.location.reload();
		};
	};

	$scope.reset = function() {
		$scope.friend = angular.copy($scope.null);
	};


	$scope.requestChecker = function(repeatScope){
		ref.child('hasRequested').child(uid).orderByChild('userId').once('value', function(snap){
			res = snap.val();
 			var requestList = [];

			for(key in res){
				requestList.push(res[key].userId);
			};
			var reqRef = ref.child('requestList').child(uid);
			reqRef.set({
				requestList:requestList
			});

			var reqRef = ref.child('requestList').child(uid);
			reqRef.on('value', function(snap){
				requestList = snap.val();

				if(requestList != null){
					var requestList2 = requestList.requestList;

					if(repeatScope.x.uid !=uid){
						console.log(requestList2);
								if(requestList2.indexOf(repeatScope.x.uid) == -1){
									//$scope.requestChecker2(repeatScope,true);
									$scope.safeApply(function(){
										repeatScope.requestCheck = true;
										var template = '<span ng-show="requestCheck" ng-click="requestCheck = !requestCheck; sendFriendRequest(x.uid,x.name,x.pic)">Send friend request.</span>'+
										'<div ng-show="!requestCheck"><span ng-click="requestCheck = !requestCheck;removeFriendRequest(x.uid)">Cancel Friend Request.</span></div>';
										repeatScope.template = $sce.trustAsHtml(template);
										console.log(repeatScope.template);
										console.log("true");
									})

								}else{
									$scope.$apply(function(){
										repeatScope.requestCheck  = false;
										repeatScope.friendOrSelf = 'Cancel friend request.';
										var template = '<span ng-show="requestCheck" ng-click="requestCheck = !requestCheck; sendFriendRequest(x.uid,x.name,x.pic)">Send friend request.</span>'+
										'<div ng-show="!requestCheck"><span ng-click="requestCheck = !requestCheck;removeFriendRequest(x.uid)">Cancel Friend Request.</span></div>';
										repeatScope.template = $sce.trustAsHtml(template);
										console.log(repeatScope.template);
										console.log(false);
									})
								}
					}else{
							console.log('Request List is populated but this is users own account.');
							$scope.$apply(function(){
								repeatScope.requestCheck = false;
								repeatScope.friendOrSelf = 'This is you!';
								repeatScope.template = "<span>This is you!</span>"
								console.log(repeatScope.template);
								console.log("false");
							})
					}

				}else{

							if(repeatScope.x.uid !=uid){
								console.log('Request List is empty.');
								$scope.safeApply(function(){
									repeatScope.requestCheck  = true;
									var template = '<span ng-show="requestCheck" ng-click="requestCheck = !requestCheck; sendFriendRequest(x.uid,x.name,x.pic)">Send friend request.</span>'+
									'<div ng-show="!requestCheck"><span ng-click="requestCheck = !requestCheck;removeFriendRequest(x.uid)">Cancel Friend Request.</span></div>';
									repeatScope.template = $sce.trustAsHtml(template);
									console.log(repeatScope.template);
									console.log("true");
								})
							}else{
								console.log('Request List is empty.');
								$scope.$apply(function(){
									repeatScope.requestCheck = false;
									repeatScope.friendOrSelf = 'This is you!';
									var template = "<span>This is you!</span>"
									repeatScope.template = $sce.trustAsHtml(template);
									console.log(repeatScope.template);
									console.log("false");
								})
							}

				};
			})
	});

	};


	$scope.safeApply = function(fn) {
	  var phase = this.$root.$$phase;
	  if(phase == '$apply' || phase == '$digest') {
	    if(fn && (typeof(fn) === 'function')) {
	      fn();
	    }
	  } else {
	    this.$apply(fn);
	  }
	};

	$scope.sendFriendRequest = function(userId,name,pic){
		req = FirebaseFriendsService.sendFriendRequest(userId,name,pic);
	};

	$scope.removeFriendRequest = function(userId){
		req = FirebaseFriendsService.removeFriendRequest(userId);
	}

	function showFriendRequests(){
		 friendRequestRef = ref.child('friendRequests').child(uid);

		friendRequestRef.on('value',function(snap){
      $scope.safeApply(function(){
        $scope.showFriendRequests = snap.val();
      });

		})
	}
	showFriendRequests();

	$scope.denyFriendRequest = function(userId){
		FirebaseFriendsService.denyFriendRequest(userId);
	}
	$scope.acceptFriendRequest = function(userId){
		FirebaseFriendsService.acceptFriendRequest(userId);
	}
})


.controller('MyprofileCtrl', function($cordovaCamera, $scope, $state, FirebaseProfileService,Auth) {

	var ref = new Firebase("https://flickering-heat-8657.firebaseio.com/");
	var authData = ref.getAuth();
	var uid = authData.uid;
 	var profileRef = ref.child("profiles").child(uid);
  var userRef = ref.child('users').child(uid);

	//show Profile
  profileRef.on("value", function(snapshot){

    $scope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if(phase == '$apply' || phase == '$digest') {
        if(fn && (typeof(fn) === 'function')) {
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };
		$scope.safeApply(function(){
			$scope.profile = snapshot.val();
			$scope.firstName = $scope.profile.firstName.substring(0,1).toUpperCase()+$scope.profile.firstName.substring(1);
			$scope.lastName = $scope.profile.lastName.substring(0,1).toUpperCase()+$scope.profile.lastName.substring(1);
		})
  });

	//edit Profile Name
	$scope.updateProfileName = function() {
	$scope.nameMessage = null;
	FirebaseProfileService.updateProfileName($scope.firstName,$scope.lastName);
	};


	$scope.updateProfilePic = function(){
		FirebaseProfileService.updateProfilePic($scope.profilePicUpload);
		console.log($scope.profilePicUpload);
	};

	$scope.updateProfileEmail = function(){
			$scope.message = null;
			$scope.error = null;

			Auth.$changeEmail({
		  oldEmail: $scope.oldEmail,
		  newEmail: $scope.newEmail,
		  password: $scope.changeEmailPass
			}).then(function() {
			  $scope.emailMessage = "Email changed successfully!";
				profileRef.update({email:$scope.newEmail});
        userRef.update({email:$scope.newEmail});
			}).catch(function(error) {
			  $scope.emailError = error;
				//location.reload(true);
			});
	};

	$scope.updateProfilePassword = function(){

		Auth.$changePassword({
		  email: $scope.profile.email,
		  oldPassword: $scope.oldPassword,
		  newPassword: $scope.newPassword
		}).then(function() {
		  $scope.passMessage = "Password changed successfully!";
		}).catch(function(error) {
		  $scope.passError = error;
		});
	};

	// Safe Apply to Angular
	$scope.safeApply = function(fn) {
		var phase = this.$root.$$phase;
		if(phase == '$apply' || phase == '$digest') {
			if(fn && (typeof(fn) === 'function')) {
				fn();
			}
		} else {
			this.$apply(fn);
		}
	};


  $scope.getPhoto = function(options) {
    var options = {
     quality: 100,
     destinationType: Camera.DestinationType.DATA_URL,
     sourceType: Camera.PictureSourceType.CAMERA,
     allowEdit: true,
     encodingType: Camera.EncodingType.JPEG,
     saveToPhotoAlbum: false,
     correctOrientation:true
   };

   $cordovaCamera.getPicture(options).then(function(imageData) {
      $scope.profilePicUpload = "data:image/jpeg;base64," + imageData;
      console.log($scope.profilePicUpload);
   }, function(err) {
     // error
   });
  };


})

/*
.controller('MyprofileCtrl', function($scope, $state, FirebaseProfileService) {

	var ref = new Firebase("https://flickering-heat-8657.firebaseio.com/");
	var authData = ref.getAuth();
	//show Profile
    var uid = authData.uid;
    var profileRef = ref.child("profiles").child(uid);
		console.log(profileRef);

    profileRef.on("value", function(snapshot){
			$scope.safeApply(function(){
				$scope.profile = snapshot.val();
			})


			console.log($scope.profile);
    });

		//edit profile
		$scope.null = {};
		$scope.entry = {};
		$scope.update = function(updateProfile) {
			$scope.entry = angular.copy(updateProfile);


			FirebaseProfileService.updateProfile($scope.entry);

			$scope.updateProfile = angular.copy($scope.null);
			console.log($scope.entry);
			$scope.reset();
		};

		$scope.reset = function() {
			$scope.updateProfile = angular.copy($scope.null);
		};

		// Safe Apply to Angular
		$scope.safeApply = function(fn) {
			var phase = this.$root.$$phase;
			if(phase == '$apply' || phase == '$digest') {
				if(fn && (typeof(fn) === 'function')) {
					fn();
				}
			} else {
				this.$apply(fn);
			}
		};


})
*/
.controller('MygrandchildrenCtrl', function($scope,$state,FirebaseGrandkidService) {
	var ref = new Firebase("https://flickering-heat-8657.firebaseio.com/");
	var authData = ref.getAuth();
	//showGkids
		var uid = authData.uid;
		var gkidRef = ref.child("grandchildren"+"/"+uid);

		gkidRef.on("value", function(snapshot){

      // Safe Apply to Angular
    	$scope.safeApply = function(fn) {
    		var phase = this.$root.$$phase;
    		if(phase == '$apply' || phase == '$digest') {
    			if(fn && (typeof(fn) === 'function')) {
    				fn();
    			}
    		} else {
    			this.$apply(fn);
    		}
    	};

      $scope.safeApply(function(){
        $scope.showGkids = snapshot.val();
      });

		});


	//Remove Gkid
  $scope.removeGkid = function(data){
		console.log(data);
		FirebaseGrandkidService.removeGkid(data);
	};
	//Add Gkid Form
	$scope.null = {};
	$scope.entry = {};
	$scope.update = function(gkid) {
		$scope.entry = angular.copy(gkid);

    if(gkid.firstName === undefined || gkid.lastName === undefined){
      $scope.message = 'First and last names required!'
    }

    var firstName = $scope.entry.firstName.toLowerCase();
    var lastName = $scope.entry.lastName.toLowerCase();

		var gkidData = {
			firstName:firstName,
			lastName:lastName,
		}
		FirebaseGrandkidService.addGkid(gkidData);
		$scope.gkid = angular.copy($scope.null);
		console.log($scope.entry);
	};
	$scope.reset = function() {
		$scope.gkid = angular.copy($scope.null);
		console.log($scope.entry);
	};

	$scope.reset();


});
