const tar = document.querySelector('#demo');
const breadcrumbList = document.querySelector("#breadcrumbList");
var breadcrumbsArray = [];

var liteViewer = WynDashboards.createViewerLite({
    dashboardId: wynConfig.dashboardId,
    token: wynConfig.token,
    baseUrl: wynConfig.baseUrl,
    lng: 'en-us', // optional
    dp: '', // optional
    theme: 'default' // options: custom theme should work with correct css file
});

window.onload = function () {

    var dashboardName = document.querySelector("#dashboardName");
    dashboardName.onclick = LoadLiteViewer;

    var scenariosList = document.querySelector("#scenariosList");
    scenariosList.onchange = btnScenario_click;

    var pagesDropdown = document.querySelector("#pagesDropdown");
    pagesDropdown.onchange = pagesDropdown_change;

    var btnPrevPage = document.querySelector("#btnPrevPage");
    btnPrevPage.onclick = btnPrevPage_click;

    var btnNextPage = document.querySelector("#btnNextPage");
    btnNextPage.onclick = btnNextPage_click;

    LoadLiteViewer();

    var liHome = document.createElement("li");
    liHome.onclick = LoadLiteViewer;
    var aHome = document.createElement("a");
    aHome.href = "#";
    breadcrumbList.appendChild(liHome);

};

function LoadLiteViewer() {

    liteViewer.destroy();
    liteViewer.initialize({
        container: tar,
    }).then((dash) => {
        const dashboardDom = document.querySelector("#dashboardContainer");

        breadcrumbsArray = [];
        breadcrumbsArray.push("Home");

        for (var i = breadcrumbList.children.length - 1; i >= 1; i--)
            breadcrumbList.removeChild(breadcrumbList.children[i]);

        var dashName = dash.name;
        document.querySelector("#dashboardName").innerHTML = dashName;

        var liHome = breadcrumbList.children[0];
        liHome.innerHTML = dashName;

        var pagesList = document.querySelector("#pagesList");

        while (pagesList.firstChild) {
            pagesList.removeChild(pagesList.firstChild);
        }

        var scenariosList = document.querySelector("#scenariosList");
        var pagesDropdown = document.querySelector("#pagesDropdown");

        var p, Q = pagesDropdown.options.length - 1;
        for (p = Q; p >= 0; p--) {
            pagesDropdown.remove(p);
        }

        var i, L = scenariosList.options.length - 1;
        for (i = L; i >= 0; i--) {
            scenariosList.remove(i);
        }

        let optPageDefault = new Option(" Select a Page ", 0);
        pagesDropdown.add(optPageDefault, undefined);

        let optScenarioDefault = new Option(" Select an individual Chart ", 0);
        scenariosList.add(optScenarioDefault, undefined);

        for (var p = 0; p < dash.pages.length; p++) {
            var page = dash.pages[p];

            var liPage = document.createElement("li");
            liPage.innerHTML = page.name;
            liPage.onclick = liPage_click;

            pagesList.appendChild(liPage);

            let opt = new Option(page.name, page.name);
            pagesDropdown.add(opt, undefined);

            for (var s in page.scenarios) {
                var scenario = page.scenarios[s];

                if (scenario.name != "" && scenario.name.indexOf("richEditor") == -1 && !scenario.name.toLowerCase().startsWith("txt") && !scenario.name.toLowerCase().startsWith("img")) {
                    let opt = new Option(scenario.name, scenario.name);
                    scenariosList.add(opt, undefined);
                }
            }
        }

        dash.connect(dashboardDom);

        // listen to the event if you need
        dash.on('render', () => {
            //console.log('>>>', dash.name, 'dash render start');
        });
        dash.on('rendered', () => {
            //console.log('>>>', dash.name, 'dash render end');
        });
        dash.on('mounted', () => {
            //console.log('>>>', dash.name, 'dash mounted');
        });

        dash.refresh();
    });
}

function liPage_click(args) {
    let page = args.srcElement.textContent;
    var pageDropDown = document.querySelector("#pagesDropdown");
    for (var i = 0; i < pageDropDown.options.length; i++) {
        if (pageDropDown.options[i].text == page)
            pageDropDown.selectedIndex = pageDropDown.options[i].index;
    }
    loadPage(page);
}

function pagesDropdown_change(args) {
    if (args.srcElement.selectedIndex == 0)
        return;

    let page = args.srcElement.selectedOptions[0].value;
    loadPage(page);
}

function btnPrevPage_click(args) {
    var pageDropDown = document.querySelector("#pagesDropdown");
    var selectedIndex = pageDropDown.selectedIndex;
    if (selectedIndex > 1) {
        loadPage(pageDropDown.options[pageDropDown.selectedIndex - 1].value);
        pageDropDown.selectedIndex = pageDropDown.selectedIndex - 1;
    }
}

function btnNextPage_click(args) {
    var pageDropDown = document.querySelector("#pagesDropdown");
    var selectedIndex = pageDropDown.selectedIndex;
    if (selectedIndex < pageDropDown.options.length - 1) {
        loadPage(pageDropDown.options[pageDropDown.selectedIndex + 1].value);
        pageDropDown.selectedIndex = pageDropDown.selectedIndex + 1;
    }
}

function loadPage(page) {
    liteViewer.destroy();
    liteViewer.initialize({
        container: tar,
    }).then((dash) => {
        const dashboardDom = document.querySelector("#dashboardContainer");
        let selectedPage = dash.getPageByName(page);

        var liPage = document.createElement("li");
        liPage.innerHTML = page;
        liPage.onclick = liPage_click;

        if (breadcrumbsArray.length > 2) {
            breadcrumbsArray.pop();
            breadcrumbList.removeChild(breadcrumbList.children[2]);
            breadcrumbList.removeChild(breadcrumbList.children[1]);
        }
        else if (breadcrumbsArray.length == 2 && breadcrumbsArray[1] != "Page") {
            breadcrumbsArray[1] = "Page";
            breadcrumbList.removeChild(breadcrumbList.children[1]);
        }
        else if (breadcrumbsArray.length == 2 && breadcrumbsArray[1] == "Page") {
            breadcrumbList.removeChild(breadcrumbList.children[1]);
        }
        else
            breadcrumbsArray.push("Page");

        breadcrumbList.appendChild(liPage);

        var scenariosList = document.querySelector("#scenariosList");

        var i, L = scenariosList.options.length - 1;
        for (i = L; i >= 0; i--) {
            scenariosList.remove(i);
        }

        let optDefault = new Option(" Select an individual Chart ", 0);
        scenariosList.add(optDefault, undefined);

        for (var s in selectedPage.scenarios) {
            var scenario = selectedPage.scenarios[s];

            if (scenario.name != "" && scenario.name.indexOf("richEditor") == -1 && !scenario.name.toLowerCase().startsWith("txt") && !scenario.name.toLowerCase().startsWith("img")) {
                let opt = new Option(scenario.name, scenario.name);
                scenariosList.add(opt, undefined);
            }
        }
        selectedPage.connect(dashboardDom);
        selectedPage.refresh();
    });
}

function btnScenario_click(args) {

    if (args.srcElement.selectedIndex == 0)
        return;

    var scenarioName = args.srcElement.selectedOptions[0].value;

    liteViewer.destroy();
    liteViewer.initialize({
        container: tar,
    }).then((dash) => {
        const dashboardDom = document.querySelector("#dashboardContainer");

        var liScenario = document.createElement("li");
        liScenario.innerHTML = scenarioName;
        liScenario.onclick = btnScenario_click;

        if (breadcrumbsArray.length == 3 && breadcrumbsArray[2] == "Scenario" && breadcrumbList.children.length == 3) {
            breadcrumbList.removeChild(breadcrumbList.children[2]);
        }
        else if (breadcrumbsArray.length == 2 && breadcrumbsArray[1] == "Scenario") {
            for (var i = breadcrumbList.children.length - 1; i >= 1; i--)
                breadcrumbList.removeChild(breadcrumbList.children[i]);
        }
        else if (breadcrumbsArray.length == 2 && breadcrumbsArray[1] == "Page") {
            breadcrumbsArray.push("Scenario");
            for (var i = breadcrumbList.children.length - 1; i > 1; i--)
                breadcrumbList.removeChild(breadcrumbList.children[i]);
        }
        else
            breadcrumbsArray.push("Scenario");

        breadcrumbList.appendChild(liScenario);

        let selectedScenario = dash.getScenarioByName(scenarioName);
        selectedScenario.connect(dashboardDom);
        selectedScenario.refresh();
    });
}