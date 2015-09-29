/*!
 * Piwik - free/libre analytics platform
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

/**
 * Usage:
 * <div piwik-dialog="showDialog">...</div>
 * Will show dialog once showDialog evaluates to true.
 *
 * Will execute the "executeMyFunction" function in the current scope once the yes button is pressed.
 */
(function () {
    angular.module('piwikApp').directive('piwikQuickAccess', QuickAccessDirective);

    QuickAccessDirective.$inject = ['$rootElement', '$timeout', '$filter', 'siteSelectorModel', 'piwik'];

    function QuickAccessDirective ($rootElement, $timeout, $filter, siteSelectorModel, piwik) {

        return {
            restrict: 'A',
            replace: true,
            scope: {},
            templateUrl: 'plugins/CoreHome/angularjs/quick-access/quick-access.directive.html?cb=' + piwik.cacheBuster,
            link: function (scope, element, attrs) {

                var menuIndex = -1;
                var menuItems = [];
                var reportEntries = [];

                scope.reportEntries = [];
                scope.menuItems  = [];
                scope.sitesModel = siteSelectorModel;
                scope.hasSitesSelector = angular.element('[piwik-siteselector]').length;

                function trim(str) {
                    return str.replace(/^\s+|\s+$/g,'');
                }

                function getMenuItems()
                {
                    if (menuItems && menuItems.length) {
                        return menuItems;
                    }

                    $rootElement.find('#topRightBar a').each(function (index, element) {
                        var text = trim($(element).text());

                        if (text) {
                            menuItems.push({name: text, index: ++menuIndex, category: 'menuCategory'});
                            $(element).attr('quick_access', menuIndex);
                        }
                    });

                    return menuItems;
                }

                function getReportEntries()
                {
                    if (reportEntries && reportEntries.length) {
                        return reportEntries;
                    }

                    $rootElement.find('#secondNavBar a').each(function (index, element) {
                        var text = trim($(element).text());

                        if (text) {
                            reportEntries.push({name: text, category: 'reportCategory', index: ++menuIndex});
                            $(element).attr('quick_access', menuIndex);
                        }
                    });

                    return reportEntries;
                }

                function highlightPreviousItem()
                {
                    if (0 >= (scope.search.index - 1)) {
                        scope.search.index = 0;
                    } else {
                        scope.search.index--;
                    }
                }

                function highlightNextItem()
                {
                    var numTotal = element.find('li.result').length;

                    if (numTotal <= (scope.search.index + 1)) {
                        scope.search.index = numTotal - 1;
                    } else {
                        scope.search.index++;
                    }
                }

                function executeMenuItem()
                {
                    var results = element.find('li.result');
                    if (results && results.length && results[scope.search.index]) {
                        var selectedMenuElement = $(results[scope.search.index]);
                        $timeout(function () {
                            selectedMenuElement.click();
                        }, 20);
                    }
                }

                function activateSearch()
                {
                    scope.$eval('view.searchActive = true');
                    $timeout(function () {
                        scope.$apply();
                    }, 0);
                }

                function deactivateSearch()
                {
                    scope.$eval('search.term = ""');
                    scope.$eval('view.searchActive = false');
                    element.find('input').blur();
                    $timeout(function () {
                        scope.$apply();
                    }, 0);
                }

                scope.onKeypress = function (event) {

                    if (38 == event.which) {
                        highlightPreviousItem();
                        event.preventDefault();
                    } else if (40 == event.which) {
                        highlightNextItem();
                        event.preventDefault();
                    } else if (13 == event.which) {
                        executeMenuItem();
                    }
                };

                scope.search = function (searchTerm) {
                    this.search.index  = 0;

                    this.menuItems     = $filter('filter')(getMenuItems(), searchTerm);
                    this.reportEntries = $filter('filter')(getReportEntries(), searchTerm);

                    if (scope.hasSitesSelector) {
                        this.sitesModel.searchSite(searchTerm);
                    }
                };

                scope.selectSite = function (idsite) {
                    this.sitesModel.loadSite(idsite);
                };

                scope.selectMenuItem = function (index) {
                    var target = $rootElement.find('[quick_access=' + index + ']');

                    if (target && target.length && target[0]) {
                        deactivateSearch();

                        var actualTarget = target[0];

                        var href = $(actualTarget).attr('href');

                        if (href && href.length > 10) {
                            actualTarget.click();
                        } else {
                            $(actualTarget).click();
                        }
                    }
                };

                Mousetrap.bind('alt+f', function(event) {
                    if (event.preventDefault) {
                        event.preventDefault();
                    } else {
                        event.returnValue = false; // IE
                    }

                    scope.$eval('view.searchActive = true');
                    $timeout(function () {
                        scope.$apply();
                    }, 0);
                });

            }
        };
    }
})();