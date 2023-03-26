/**
 * Created by mauryapatel on 12/10/18.
 */
var app = angular.module("myApp", ["ngRoute"]);
app.config(function($routeProvider){
    $routeProvider.
    when("/login", {
        templateUrl: "login.html",
        controller: "LoginCtrl"
    }).
    when("/dashboard",{
        templateUrl : "dashboard.html",
        controller: "DashboardCtrl"
    }).
    otherwise ({
        redirectTo: '/login'
    });
});

app.factory('CommonControl', function() {
        return {
            global : {}
        };
    }
);

app.factory('Session',
    function (CommonControl,$location,$rootScope) {
        return{
            getSession : function () {
                if(CommonControl.global.user == undefined)
                {
                    $location.path("/login");
                    $rootScope.Model.user = undefined;
                }
            }
        };
    }
);

app.factory('socket', function ($rootScope) {
    var socket = io.connect('http://localhost:8081');
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});

app.directive('keyshortcut', ['$rootScope','socket',function(rootScope,socket) {
    return {
        link: function ($scope, $element, $attrs,$emit) {
            $element.bind("keydown", function (event) {
                rootScope.$broadcast('keydown',event.which);
            });

            socket.on('message', function (data) {
                data = data.replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '') ;
                
                if(data.length>1)
                    data = data.substr(0,data.length-2)+'.'+data.substr(data.length-2);
                
		if(isNaN(data))
			return;
		data = parseFloat(data);
		//console.log(data);
                /*if(data.toString().split(".").length>1)
                    window.localStorage.setItem('dp',data.toString().split(".")[3].length);
                else
                    window.localStorage.setItem('dp',3);
                data = parseFloat(data);
                data = data.toFixed(parseInt(window.localStorage.getItem('dp')));
                */

		    rootScope.$broadcast('onWeightChange',data);
		
            });

            
            socket.on('forceprint', function (data) {
                rootScope.$broadcast('forceprint',data);
            });

            socket.on('printdone', function (data) {
                rootScope.$broadcast('printdone',data);
            });

            socket.on('reply', function (data) {
                rootScope.$broadcast('reply',data);
            });


        }
    };
}
]);

app.directive('exportToCsv',function(){
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var el = element[0];
            var date = new Date();
            element.bind('click', function(e){
                var table = e.target.nextElementSibling;
                var csvString = '';
                for(var i=0; i<table.rows.length;i++){
                    var rowData = table.rows[i].cells;
                    for(var j=0; j<rowData.length;j++){
                        csvString = csvString + rowData[j].innerHTML + ",";
                    }
                    csvString = csvString.substring(0,csvString.length - 1);
                    csvString = csvString + "\n";
                }
                csvString = csvString.substring(0, csvString.length - 1);
                var a = $('<a/>', {
                    style:'display:none',
                    href:'data:application/octet-stream;base64,'+btoa(csvString),
                    download:date.toString()+'.csv'
                }).appendTo('body')
                a[0].click()
                a.remove();
            });
        }
    }
});


app.controller("main",function (socket,$scope,$interval,$timeout,$rootScope,$http,$window,$location,$q,$sce,$filter,CommonControl,Session) {
    $rootScope.Model = {};
    $rootScope.Model.isLogin = false;
    $scope.$on('$viewContentLoaded', function(){
        console.log("MainCtrl");
    });
    
    $scope.dashboard = function () {
        $location.path("/login" );
    }

    $scope.dispatch = function () {
        $location.path("/process_z" );
    }
    
    $scope.company_master = function () {
        $location.path("/company_master" );
    }

    $scope.material_master = function () {
        $location.path("/material_master" );
    }

    $scope.report = function () {
        $location.path("/report" );
    }

});

app.controller("LoginCtrl",function (socket,$scope,$interval,$timeout,$rootScope,$http,$window,$location,$q,$sce,$filter,CommonControl,Session) {

    $scope.Model = {};

    var destroy_reply;

    $scope.Model.reply = false;
    destroy_reply = $rootScope.$on('reply', function (evt,data) {
        console.log(data);
        $scope.Model.reply = data;
    });
    
    $scope.$on('$destroy', function() {
        destroy_reply();
     });  

    $scope.Model.shift = [{"Name":"1","Id":1},{"Name":"2","Id":2},{"Name":"3","Id":3}];
    $scope.Model.selectedShift = undefined;
    
    $scope.$on('$viewContentLoaded', function(){
        console.log("LoginCtrl");
        Session.getSession();
        $scope.Model.cWeight = "0.00";
        $rootScope.Model.isLogin = false;
        $scope.Model.username = "vincent";
        $scope.Model.password = "vincent@123";
        $scope.Model.selectedShift = $scope.Model.shift[0];
    });

    $scope.scale = function () {
        $location.path("/login");
    }

    $scope.login = function () {

        //Role = 1 
        if($scope.Model.username == undefined || $scope.Model.username.length == 0)
        {
            alert("Username should not be empty.");
            return;
        }

        if($scope.Model.password == undefined || $scope.Model.password.length == 0)
        {
            alert("Password should not be empty.");
            return;
        }

        if($scope.Model.selectedShift == undefined)
        {
            alert("Please select Shift");
            return;
        }

        $http({
            url: '/api/login',
            method: "POST",
            data: {'username':$scope.Model.username,'password':$scope.Model.password}
        })
            .then(function(response) {
                    if(response.data.error == true)
                        alert(response.data.message);
                    else{
                        $rootScope.Model.isLogin = true;
                        CommonControl.global.user = response.data.data[0];
                        $rootScope.Model.user = CommonControl.global.user;
                        $rootScope.Model.user.shift = $scope.Model.selectedShift;
                        console.log($rootScope.Model.user);
                        $location.path("/dashboard" );
                    }
                },
                function(response) { // optional
                    alert("Something Went Wrong!");
                });
    }
});

app.controller("DashboardCtrl", function(socket,$scope,$interval,$timeout,$rootScope,$http,$window,$location,$q,$sce,$filter,CommonControl,Session) {

    $scope.Model = {};
    $scope.Model.productList = [];
    $scope.Model.selectedProduct;
    var weightlock = false;
    var doprint = 0;
    var lastWeight = 0;
    
    var destroy_forceprint;
    var destroy_printdone;
    var destroy_weight;

    var destroy_reply;

    $scope.Model.reply = false;
    destroy_reply = $rootScope.$on('reply', function (evt,data) {
        console.log(data);
        $scope.Model.reply = data;
    });
    
    destroy_weight = $rootScope.$on('onWeightChange', function (evt,data) {

        if(weightlock == true)
            return;

        var weight = data;
        $scope.Model.cWeight = weight;
        //lastWeightData = weight;
        lastWeight = parseFloat(data);
        if(lastWeight <= 0.10){
            doprint = 0;
        }

    });

    destroy_forceprint = $rootScope.$on('forceprint', function (evt,data) {
        $scope.manual();
    });

    $scope.$on('$destroy', function() {
       destroy_forceprint();
       destroy_printdone();
       destroy_weight();
       destroy_reply();
    });  

    destroy_printdone = $rootScope.$on('printdone', function (evt,data) {
        weightlock = false;
        getPackedCount();
    });

    $scope.manual = function () {
	    if(doprint == 0){
	        if(lastWeight > 5)
	        {   
                weightlock = true;
                doprint = 1;
                $timeout(function () {
                    console.log("Push");
                    $scope.save();
                },500);
            }
        }
    }

    $scope.$on('$viewContentLoaded', function(){
        console.log("DashboardCtrl");
        $scope.Model.cWeight = "0.00";
        $scope.Model.printcopy = 1;
        $scope.Model.totalPackedCount = 0;
        getPackedCount();
        getProductList();
        Session.getSession();
    });

    function getPackedCount() {
        $http.get('/api/getPackingCount?temp='+Math.random())
            .then(function(response) {
                $scope.Model.totalPackedCount = response.data.data[0].Count;
            });
    }

    function getProductList() {
        $scope.Model.productList = [];
        $http.get('/api/getProductMaster?temp='+Math.random())
            .then(function(response) {
                $scope.Model.productList  = response.data.data;
            });
    }

    $scope.reset = function () {
        $http.get('/api/resetPackingCount?temp='+Math.random())
            .then(function(response) {
                $scope.Model.totalPackedCount = response.data.data;
            });
    }
    
    $scope.tareSet = function () {
        $scope.Model.tareWeight = lastWeight;
    }

    $scope.duplicate = function (event) {
        if(event.keyCode == 13)
        {
            if($scope.Model.duplicate == undefined || $scope.Model.duplicate.length == 0)
            {
                alert("Please Enter Valid Barcode No.");
                return;
            }
            if($scope.Model.printcopy == undefined || $scope.Model.printcopy.length == 0)
            {
                alert("Please Enter Print Copy");
                return;
            }
            $http({
                url: '/api/duplicate_print',
                method: "POST",
                data: {
                    'barcode':$scope.Model.duplicate,
                    'PrintCopy':$scope.Model.printcopy
                }
            })
                .then(function(response) {
                        $scope.Model.duplicate = "";
                        if(response.data.error)
                        {
                            alert(response.data.message);
                        }
                    },
                    function(response) { // optional
                        alert("Something Went Wrong!");
                    });
        }
    }

    $scope.testPrint = function () {

        if($scope.Model.selectedProduct == undefined)
        {
            alert("Please select Product");
            return;
        }

        if($scope.Model.tareWeight == undefined || $scope.Model.tareWeight.length == 0)
        {
            alert("Please Enter Tare Weight");
            return;
        }

        if($scope.Model.printcopy == undefined || $scope.Model.printcopy.length == 0)
        {
            alert("Please Enter Print Copy");
            return;
        }

        if($scope.Model.extra1 == undefined)
            $scope.Model.extra1 = "";

        if($scope.Model.extra2 == undefined)
            $scope.Model.extra2 = "";

        if($scope.Model.remarks == undefined)
            $scope.Model.remarks = "";

        $http({
            url: '/api/test_product_data',
            method: "POST",
            data: {'Gross':"0.00",'Tare':"0.00",
                'Net':"0.00",
                'ProductId':$scope.Model.selectedProduct.Id,
                'Name':$scope.Model.selectedProduct.Name,
                'Weight':$scope.Model.selectedProduct.Weight,
                'PackedById':$rootScope.Model.user.Id,
                'PackedByName':$rootScope.Model.user.FullName,
                'PackedByCode':$rootScope.Model.user.Code,
                'Shift':$rootScope.Model.user.shift.Name,
                'Extra1':$scope.Model.extra1,
                'Extra2':$scope.Model.extra2,
                'Remarks':$scope.Model.remarks,
                'PrintCopy':$scope.Model.printcopy
            }
        })
            .then(function(response) {

                },
                function(response) { // optional
                    alert("Something Went Wrong!");
                });

    }

    $scope.save = function () {

        if($scope.Model.reply == false)
        {
            alert("Internet connection is not available...");
            return;
        }

        if($scope.Model.selectedProduct == undefined)
        {
            alert("Please select Product");
            return;
        }

        if($scope.Model.tareWeight == undefined || $scope.Model.tareWeight.length == 0)
        {
            alert("Please Enter Tare Weight");
            return;
        }

        if($scope.Model.printcopy == undefined || $scope.Model.printcopy.length == 0)
        {
            alert("Please Enter Print Copy");
            return;
        }

        if($scope.Model.extra1 == undefined)
            $scope.Model.extra1 = "";

        if($scope.Model.extra2 == undefined)
            $scope.Model.extra2 = "";

        if($scope.Model.remarks == undefined)
            $scope.Model.remarks = "";

        //lastWeight  = 23.14;   
        var net = parseFloat(parseFloat(lastWeight) - parseFloat($scope.Model.tareWeight));
        net = parseFloat(net).toFixed(2);

        $http({
            url: '/api/insert_product_data',
            method: "POST",
            data: {'Gross':lastWeight,'Tare':$scope.Model.tareWeight,
                'Net':net,
                'ProductId':$scope.Model.selectedProduct.Id,
                'Name':$scope.Model.selectedProduct.Name,
                'Weight':$scope.Model.selectedProduct.Weight,
                'PackedById':$rootScope.Model.user.Id,
                'PackedByName':$rootScope.Model.user.FullName,
                'PackedByCode':$rootScope.Model.user.Code,
                'Shift':$rootScope.Model.user.shift.Name,
                'Extra1':$scope.Model.extra1,
                'Extra2':$scope.Model.extra2,
                'Remarks':$scope.Model.remarks,
                'PrintCopy':$scope.Model.printcopy
            }
        })
        .then(function(response) {
                getPackedCount();
                //alert(response.data.message);
            },
            function(response) { // optional
                alert("Something Went Wrong!");
            });

    }

});

