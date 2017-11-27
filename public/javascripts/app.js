var app = angular.module('ebuyreportsModule', ['chart.js']);
app.controller('reportController', function($scope, $http, $filter) {
    $scope.data = [];
    $scope.viewData = [];
    $scope.wholeData = [];
    $scope.sortColumn;
    $scope.sortType;
    $scope.totalPages;
    $scope.currentPage = 1;
    $scope.recordsPerPage = 30;
    $scope.filterModel = {};

    var request = $http.get('/data');
    request.success(function(data) {
        $scope.viewData = data;
        $scope.wholeData = angular.copy(data);
        $scope.setRecords();
    });
    request.error(function(data) {
        console.log('Error: ' + data);
    });

    $scope.setRecords = function() {
        var currentIndex = ($scope.currentPage - 1) * $scope.recordsPerPage;
        if ($scope.sortColumn && $scope.sortType) {
            var sortedArray = $filter('orderBy')($scope.viewData, $scope.sortColumn, $scope.sortType == 'DSC');
            $scope.data = sortedArray.slice(currentIndex, currentIndex + $scope.recordsPerPage);
        } else $scope.data = $scope.viewData.slice(currentIndex, currentIndex + $scope.recordsPerPage);
        $scope.totalPages = Math.ceil($scope.viewData.length / $scope.recordsPerPage);
        $scope.$broadcast('genrateReport');
    };


    $scope.navigatePage = function(inc) {
        var curPage = $scope.currentPage + inc;

        if (curPage < 1) curPage = 1;
        else if (curPage > $scope.totalPages) curPage = $scope.totalPages;

        if (curPage != $scope.currentPage) {
            $scope.currentPage = curPage;
            $scope.setRecords();
        }
    };

    $scope.sortRecord = function(col) {
        if ($scope.sortColumn == col) $scope.sortType = $scope.sortType == 'ASC' ? 'DSC' : 'ASC';
        else $scope.sortType = 'ASC';
        $scope.sortColumn = col;
        $scope.setRecords();
    };

    $scope.filterRecords = function() {
        $scope.viewData = $filter('filter')($scope.wholeData, $scope.filterModel);
        $scope.setRecords();
    };

    $scope.checkUnCheckAllRecord = function(){
        $scope.data.forEach(function(item) { item['isChecked'] = $scope.checkAllRecord});
        $scope.updateChart();
    };

    $scope.updateChart = function(){
        $scope.$broadcast('genrateReport');
    };
});


app.controller('chartController', function($scope, $http, $filter) {
    $scope.reportType = 'line';
    $scope.groupBy = 'product';

    $scope.genrateReport = function() {
        var viewData = $scope.$parent.viewData,
            selectedData = [];
        viewData.forEach(function(data) {
            if (data.isChecked) selectedData.push(data);
        });
        if (selectedData.length > 0) {
            $scope.setReportParams(selectedData);
        } else $scope.setReportParams(viewData.slice(0,viewData.length));
    };

    $scope.$on('genrateReport', function (event) {
        $scope.genrateReport();
    });

    $scope.onClick = function(points, evt) {
        console.log(points, evt);
    };

    $scope.setReportParams = function(records) {
        $scope.labels = $scope.series = $scope.data = $scope.datasetOverride = $scope.options = null;
        if ($scope.reportType == 'line') {
            $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
            $scope.options = {
                scales: {
                    yAxes: [{
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
        };

        //if ($scope.reportType == 'line' || $scope.reportType == 'bar') {
        if ($scope.groupBy == 'user') {
            $scope.series = ['Quantity', 'Amount'];
            $scope.labels = [];
            $scope.data = new Array(2);
            $scope.data[0] = [];
            $scope.data[1] = [];
            $scope.minimumAmount = null;
            $scope.maximumAmount = $scope.totalAmount = 0;

            records.forEach(function(item) {
                $scope.labels.push(item.username);
                $scope.data[0].push(item.quantity);
                $scope.data[1].push(item.amount);

                $scope.totalAmount += item.amount;
                if($scope.minimumAmount == null) $scope.minimumAmount = item.amount;
                else if(item.amount<$scope.minimumAmount) $scope.minimumAmount = item.amount;
                if(item.amount>$scope.maximumAmount) $scope.maximumAmount = item.amount;
            });

            $scope.averageAmount = $scope.totalAmount / records.length;
            // $scope.minimumAmount = $scope.arrayMin($scope.data[1]);
            // $scope.maximumAmount = $scope.arrayMax($scope.data[1]);
        }
        else if($scope.groupBy == 'product zone' || $scope.groupBy == 'product'){

            /*grouping*/
            $scope.grpProductZone = [];
            records.forEach(function(item) {
                var found;
                $scope.grpProductZone.forEach(function(product) {
                    if(product.type==item[$scope.groupBy]){
                        found = true;
                        product.data.push(item);
                    }
                });
                if(!found){
                    $scope.grpProductZone.push({type:item[$scope.groupBy],data:[item]});
                }
            });
            /*grouping*/

            $scope.series = ['UserCount', 'TotalRevenue'];
            $scope.labels = [];
            $scope.data = new Array(2);
            $scope.data[0] = [];
            $scope.data[1] = [];

            $scope.grpProductZone.forEach(function(product) {
                $scope.labels.push(product.type);
                $scope.data[0].push(product.data.length);
                var totalRevenue = 0;
                product.data.forEach(function(item){
                    totalRevenue+=item.amount
                });
                $scope.data[1].push(totalRevenue);
            });
        }
        //}
    };

    // $scope.arrayMin = function(arr) {
    //     return arr.reduce(function(p, v) {
    //         return (p < v ? p : v);
    //     });
    // };

    // $scope.arrayMax = function(arr) {
    //     return arr.reduce(function(p, v) {
    //         return (p > v ? p : v);
    //     });
    // };
});