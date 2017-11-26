var app = angular.module('ebuyreportsModule', ['chart.js']);
app.controller('reportController', function($scope, $http, $filter) {
    $scope.data = [];
    $scope.viewData = [];
    $scope.wholeData = [];
    $scope.sortColumn;
    $scope.sortType;
    $scope.totalPages;
    $scope.currentPage=1;
    $scope.recordsPerPage=30;
    $scope.filterModel = {};

    var request = $http.get('/data');
    request.success(function(data) {
        $scope.viewData = data;
        $scope.wholeData = angular.copy(data);
        $scope.setRecords();
    });
    request.error(function(data){
        console.log('Error: ' + data);
    });

    $scope.setRecords = function(){
        var currentIndex = ($scope.currentPage-1)*$scope.recordsPerPage;
        if($scope.sortColumn && $scope.sortType){
            var sortedArray = $filter('orderBy')($scope.viewData, $scope.sortColumn, $scope.sortType == 'DSC');
            $scope.data = sortedArray.slice(currentIndex,currentIndex+$scope.recordsPerPage);
        }
        else $scope.data = $scope.viewData.slice(currentIndex,currentIndex+$scope.recordsPerPage);
        $scope.totalPages = Math.ceil($scope.viewData.length/$scope.recordsPerPage);
    };


    $scope.navigatePage = function(inc){
        var curPage = $scope.currentPage+inc;

        if(curPage<1) curPage = 1;
        else if(curPage>$scope.totalPages) curPage = $scope.totalPages;

        if(curPage!=$scope.currentPage){
            $scope.currentPage = curPage;
            $scope.setRecords();
        }
    };

    $scope.sortRecord = function(col){
        if($scope.sortColumn==col) $scope.sortType = $scope.sortType == 'ASC' ? 'DSC' : 'ASC';
        else $scope.sortType = 'ASC';
        $scope.sortColumn=col;
        $scope.setRecords();
    };

    $scope.filterRecords = function(){        
        $scope.viewData = $filter('filter')($scope.wholeData, $scope.filterModel);
        $scope.setRecords();
    };
});


app.controller('chartController', function($scope, $http, $filter) {
    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    $scope.series = ['Series A', 'Series B'];
    $scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
    ];
    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };
    $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
    $scope.options = {
    scales: {
        yAxes: [
            {
              id: 'y-axis-1',
              type: 'linear',
              display: true,
              position: 'left'
            },
            {
              id: 'y-axis-2',
              type: 'linear',
              display: true,
              position: 'right'
            }
            ]
        }
    };
});
