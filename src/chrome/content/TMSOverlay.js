var TooManySides = {
    prefs: null,
    defaultPosition: 1,
    hideTitleLeftSidebar: false,
    hideTitleRightSidebar: false,
    hideTitleTopSidebar: false,
    hideTitleBottomSidebar: false,
    aiosCollapse: false,

    QueryInterface: function (aIID) {
        if (aIID.equals(Components.interfaces.nsIPrefBranchInternal) ||
            aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
            aIID.equals(Components.interfaces.nsISupports))
            return this;

        throw Components.results.NS_NOINTERFACE;
    },

    observe: function (aSubject, aTopic, aData) {
        if (aTopic != "nsPref:changed")
            return;

        switch (aData) {
        case "extensions.toomanysides.hideTitleLeftSidebar":
            hideTitleLeftSidebar = prefs.getBoolPref("extensions.toomanysides.hideTitleLeftSidebar");
            TooManySides.checkSidebarHeaderVisibility(1);
            break;
        case "extensions.toomanysides.hideTitleRightSidebar":
            hideTitleRightSidebar = prefs.getBoolPref("extensions.toomanysides.hideTitleRightSidebar");
            TooManySides.checkSidebarHeaderVisibility(2);
            break;
        case "extensions.toomanysides.hideTitleTopSidebar":
            hideTitleTopSidebar = prefs.getBoolPref("extensions.toomanysides.hideTitleTopSidebar");
            TooManySides.checkSidebarHeaderVisibility(3);
            break;
        case "extensions.toomanysides.hideTitleBottomSidebar":
            hideTitleBottomSidebar = prefs.getBoolPref("extensions.toomanysides.hideTitleBottomSidebar");
            TooManySides.checkSidebarHeaderVisibility(4);
            break;
        case "extensions.toomanysides.defaultPosition":
            defaultPosition = prefs.getIntPref("extensions.toomanysides.defaultPosition");
            TooManySides.resetDefaultSidebar();
            break;
        default:
            // Sidebar setting change
            TooManySides.resetSidebarByCommand(aData.substr("extensions.toomanysides.".length));
            break;
        case "extensions.aios.collapse":
            aiosCollapse = prefs.getBoolPref("extensions.aios.collapse") && aios_allowCollapseSidebar();
            break;
        }
    },

    setSidebarTitle: function (targetSidebarCommand, newTitle) {
        var foundSidebar = false;

        for (var c = 1; (c <= 4) && !foundSidebar; c++) {
            var targetBox;
            var targetTitleId;
            if (c == 1) {
                targetBox = document.getElementById("sidebar-box");
                targetTitleId = "sidebar-title";
            } else {
                targetBox = document.getElementById("sidebar-" + c + "-box");
                targetTitleId = "sidebar-" + c + "-title";
            }
            if (!targetBox.hidden && !targetBox.collapsed) {
                var targetCommand = targetBox.getAttribute("sidebarcommand");
                if (targetCommand == targetSidebarCommand) {
                    foundSidebar = true;
                    document.getElementById(targetTitleId).value = newTitle;
                }
            }
        }

        return foundSidebar;
    },

    getSidebarTitle: function (targetSidebarCommand) {
        var foundSidebar = false;
        var foundSidebarTitle = null;

        for (var c = 1; (c <= 4) && !foundSidebar; c++) {
            var targetBox;
            var targetTitleId;
            if (c == 1) {
                targetBox = document.getElementById("sidebar-box");
                targetTitleId = "sidebar-title";
            } else {
                targetBox = document.getElementById("sidebar-" + c + "-box");
                targetTitleId = "sidebar-" + c + "-title";
            }
            if (!targetBox.hidden && !targetBox.collapsed) {
                var targetCommand = targetBox.getAttribute("sidebarcommand");
                if (targetCommand == targetSidebarCommand) {
                    foundSidebar = true;
                    foundSidebarTitle = document.getElementById(targetTitleId).value;
                }
            }
        }

        return foundSidebarTitle;
    },

    getSidebarSuffix: function (targetSidebarCommand) {
        var targetPosition;

        if (prefs.prefHasUserValue("extensions.toomanysides." + targetSidebarCommand)) {
            targetPosition = prefs.getIntPref("extensions.toomanysides." + targetSidebarCommand);
        } else {
            targetPosition = defaultPosition;
        }

        if (targetPosition == 1) {
            return "";
        } else {
            return "-" + targetPosition;
        }
    },

    isSidebarInPosition: function (targetSidebarCommand, targetPosition) {
        if (prefs.prefHasUserValue("extensions.toomanysides." + targetSidebarCommand)) {
            return (prefs.getIntPref("extensions.toomanysides." + targetSidebarCommand) == targetPosition);
        } else {
            return (defaultPosition == targetPosition);
        }
    },

    checkSidebarHeaderVisibility: function (targetSidebar) {
        var targetTitleId = "sidebar-" + targetSidebar + "-title";
        var hideHeader = false;

        switch (targetSidebar) {
        case 1:
            targetTitleId = "sidebar-title";
            hideHeader = hideTitleLeftSidebar;
            break;
        case 2:
            hideHeader = hideTitleRightSidebar;
            break;
        case 3:
            hideHeader = hideTitleTopSidebar;
            break;
        case 4:
            hideHeader = hideTitleBottomSidebar;
            break;
        }

        var sidebarHeader = document.getElementById(targetTitleId).parentNode;
        var changedHeader = false;
        if (hideHeader) {
            sidebarHeader.hidden = true;
        } else {
            sidebarHeader.hidden = false;
        }
    },

    resetDefaultSidebar: function () {
        var foundSidebar = false;

        for (var c = 1; (c <= 4) && !foundSidebar; c++) {
            var targetBox;
            if (c == 1) {
                targetBox = document.getElementById("sidebar-box");
            } else {
                targetBox = document.getElementById("sidebar-" + c + "-box");
            }
            if (!targetBox.hidden && !targetBox.collapsed) {
                var targetCommand = targetBox.getAttribute("sidebarcommand");
                if (!prefs.prefHasUserValue("extensions.toomanysides." + targetCommand)) {
                    foundSidebar = true;
                    TooManySides.closeSidebarByPosition(c);
                    toggleSidebar(targetCommand);
                }
            }
        }
    },

    resetSidebarByCommand: function (targetCommand) {
        var foundSidebar = false;

        for (var c = 1; (c <= 4) && !foundSidebar; c++) {
            var targetBox;
            if (c == 1) {
                targetBox = document.getElementById("sidebar-box");
            } else {
                targetBox = document.getElementById("sidebar-" + c + "-box");
            }
            if (!targetBox.hidden && !targetBox.collapsed && (targetBox.getAttribute("sidebarcommand") == targetCommand)) {
                foundSidebar = true;
                TooManySides.closeSidebarByPosition(c);
                toggleSidebar(targetCommand);
            }
        }
    },

    delayedSidebarLoad: function (targetSidebar) {
        var sidebar = document.getElementById("sidebar-" + targetSidebar);
        var box = document.getElementById("sidebar-" + targetSidebar + "-box");
        sidebar.setAttribute("src", box.getAttribute("src"));
    },

    init: function () {
        if (typeof window.newToggleSidebar == "function") {
            window.oldToggleSidebar = TooManySides.toggleSidebar;
        } else {
            // Override toggle sidebar function
            window.toggleSidebar = TooManySides.toggleSidebar;
        }

        // "Fix" openWebPanel functions
        if (window.openWebPanel) {
            eval("window.openWebPanel =" + window.openWebPanel.toString().replace(
                    'document.getElementById(\"sidebar-title"\).value = aTitle;',
                    'TooManySides.setSidebarTitle\("viewWebPanelsSidebar", aTitle\);').replace(
                    'document.getElementById\("sidebar"\)',
                    'document.getElementById\("sidebar" + TooManySides.getSidebarSuffix\("viewWebPanelsSidebar"\)\)'));
        }
        if (window.asyncOpenWebPanel) {
            eval("window.asyncOpenWebPanel =" + window.asyncOpenWebPanel.toString().replace(
                    'document.getElementById\("sidebar"\)',
                    'document.getElementById\("sidebar" + TooManySides.getSidebarSuffix\("viewWebPanelsSidebar"\)\)'));
        }

        // Restore sidebars
        for (var c = 2; c <= 4; c++) {
            var sidebarSplitter;
            if (window.opener && !window.opener.closed) {
                var openerSidebarBox = window.opener.document.getElementById("sidebar-" + c + "-box");
                // The opener can be the hidden window too, if we're coming from the state
                // where no windows are open, and the hidden window has no sidebar box.
                if (openerSidebarBox && !openerSidebarBox.hidden && !openerSidebarBox.collapsed) {
                    var sidebar = document.getElementById("sidebar-" + c);
                    var sidebarBox = document.getElementById("sidebar-" + c + "-box");
                    var sidebarTitle = document.getElementById("sidebar-" + c + "-title");
                    sidebarTitle.setAttribute("value", window.opener.document.getElementById("sidebar-" + c + "-title").getAttribute("value"));
                    sidebarBox.setAttribute("width", openerSidebarBox.boxObject.width);
                    var sidebarCmd = openerSidebarBox.getAttribute("sidebarcommand");
                    sidebarBox.setAttribute("sidebarcommand", sidebarCmd);
                    sidebarBox.setAttribute("src", window.opener.document.getElementById("sidebar-" + c).getAttribute("src"));
                    setTimeout(TooManySides.delayedSidebarLoad, 0, c);
                    sidebarBox.hidden = false;
                    sidebarSplitter = document.getElementById("sidebar-" + c + "-splitter");
                    sidebarSplitter.hidden = false;
                    document.getElementById(sidebarCmd).setAttribute("checked", "true");
                }
            } else {
                var box = document.getElementById("sidebar-" + c + "-box");
                if (box.hasAttribute("sidebarcommand")) {
                    var commandID = box.getAttribute("sidebarcommand");
                    if (commandID) {
                        var command = document.getElementById(commandID);
                        if (command) {
                            sidebarSplitter = document.getElementById("sidebar-" + c + "-splitter");
                            box.hidden = false;
                            sidebarSplitter.hidden = false;
                            setTimeout(TooManySides.delayedSidebarLoad, 0, c);
                            command.setAttribute("checked", "true");
                        } else {
                            // Remove the |sidebarcommand| attribute, because the element it
                            // refers to no longer exists, so we should assume this sidebar
                            // panel has been uninstalled. (249883)
                            box.removeAttribute("sidebarcommand");
                        }
                    }
                }
            }
        }

        prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

        defaultPosition = prefs.getIntPref("extensions.toomanysides.defaultPosition");

        for (var c = 1; c <= 4; c++) {
            var targetTitleId;
            var hidePref;
            switch (c) {
            case 1:
                targetTitleId = "sidebar-title";
                hideTitleLeftSidebar = prefs.getBoolPref("extensions.toomanysides.hideTitleLeftSidebar");
                hidePref = hideTitleLeftSidebar;
                break;
            case 2:
                targetTitleId = "sidebar-" + c + "-title";
                hideTitleRightSidebar = prefs.getBoolPref("extensions.toomanysides.hideTitleRightSidebar");
                hidePref = hideTitleRightSidebar;
                break;
            case 3:
                targetTitleId = "sidebar-" + c + "-title";
                hideTitleTopSidebar = prefs.getBoolPref("extensions.toomanysides.hideTitleTopSidebar");
                hidePref = hideTitleTopSidebar;
                break;
            case 4:
                targetTitleId = "sidebar-" + c + "-title";
                hideTitleBottomSidebar = prefs.getBoolPref("extensions.toomanysides.hideTitleBottomSidebar");
                hidePref = hideTitleBottomSidebar;
                break;
            }
            var sidebarHeader = document.getElementById(targetTitleId).parentNode;
            if (hidePref) {
                sidebarHeader.hidden = true;
            }
            sidebarHeader.setAttribute("context", "toomanysides-context");
        }

        try {
            aiosCollapse = prefs.getBoolPref("extensions.aios.collapse") && aios_allowCollapseSidebar();
        } catch (e) {}

        // Add observer
        Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2).addObserver("extensions.toomanysides.", this, false);
        Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2).addObserver("extensions.aios.collapse", this, false);
    },

    unload: function () {
        var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService();
        var windowManagerInterface = windowManager.QueryInterface(Components.interfaces.nsIWindowMediator);
        var enumerator = windowManagerInterface.getEnumerator(null);
        enumerator.getNext();
        if (!enumerator.hasMoreElements()) {
            for (var c = 2; c <= 4; c++) {
                document.persist("sidebar-" + c + "-box", "sidebarcommand");
                if (c == 2) {
                    document.persist("sidebar-" + c + "-box", "width");
                } else {
                    document.persist("sidebar-" + c + "-box", "height");
                }
                document.persist("sidebar-" + c + "-box", "src");
                document.persist("sidebar-" + c + "-title", "value");
            }
        }
        // Unregister observers
        Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2).removeObserver("extensions.toomanysides.", this);
        Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2).removeObserver("extensions.aios.collapse", this);
    },

    // |forceOpen| is a bool that indicates that the sidebar should be forced open.  In other words
    // the toggle won't be allowed to close the sidebar.
    toggleSidebar: function (aCommandID, forceOpen) {
        var sidebarId = "sidebar";
        var sidebarTitleId = "sidebar-title";
        var sidebarSplitterId = "sidebar-splitter";
        var sidebarBoxId = "sidebar-box";

        if (aCommandID) {
            var position;
            if (prefs.prefHasUserValue("extensions.toomanysides." + aCommandID)) {
                position = prefs.getIntPref("extensions.toomanysides." + aCommandID);
            } else {
                position = defaultPosition;
            }
            if (position > 1) {
                sidebarId = "sidebar-" + position;
                sidebarTitleId = "sidebar-" + position + "-title";
                sidebarSplitterId = "sidebar-" + position + "-splitter";
                sidebarBoxId = "sidebar-" + position + "-box";
            }
        }

        var sidebarBox = document.getElementById(sidebarBoxId);
        if (!aCommandID)
            aCommandID = sidebarBox.getAttribute("sidebarcommand");

        var elt = document.getElementById(aCommandID);
        var sidebar = document.getElementById(sidebarId);
        var sidebarTitle = document.getElementById(sidebarTitleId);
        var sidebarSplitter = document.getElementById(sidebarSplitterId);

        if (!forceOpen && elt.getAttribute("checked") == "true") {
            elt.removeAttribute("checked");
            if (TooManySides.aiosCollapse) {
                sidebarBox.collapsed = true;
            } else {
                sidebarBox.hidden = true;
                sidebarBox.setAttribute("sidebarcommand", "");
                sidebarTitle.setAttribute("value", "");
                sidebar.setAttribute("src", "about:blank");
            }
            sidebarSplitter.hidden = true;

            content.focus();
            return;
        }

        //  var elts = document.getElementsByAttribute("group", "sidebar");
        //  for (var i = 0; i < elts.length; ++i)
        //    elts[i].removeAttribute("checked");
        if (sidebarBox.hasAttribute("sidebarcommand")) {
            var oldCommand = document.getElementById(sidebarBox.getAttribute("sidebarcommand"));
            if (oldCommand) {
                oldCommand.removeAttribute("checked");
            }
        }

        elt.setAttribute("checked", "true");

        if (sidebarBox.hidden || sidebarBox.collapsed) {
            sidebarSplitter.hidden = false;
            sidebarBox.hidden = false;
            if (TooManySides.aiosCollapse) {
                if (sidebarBox.collapsed && (elt.id == sidebarBox.getAttribute("sidebarcommand"))) {
                    sidebarBox.collapsed = false;
                    return;
                }
                sidebarBox.collapsed = false;
            }
        }

        var url = elt.getAttribute("sidebarurl");
        var title = elt.getAttribute("sidebartitle");
        if (!title)
            title = elt.getAttribute("label");
        sidebar.setAttribute("src", url);
        sidebarBox.setAttribute("src", url);
        sidebarBox.setAttribute("sidebarcommand", elt.id);
        sidebarTitle.setAttribute("value", title);

        if (aCommandID != "viewWebPanelsSidebar") { // no searchbox there
            // if the sidebar we want is already constructed, focus the searchbox
            if ((aCommandID == "viewBookmarksSidebar" && sidebar.contentDocument.getElementById("bookmarksPanel"))
                 || (aCommandID == "viewHistorySidebar" && sidebar.contentDocument.getElementById("history-panel")))
                sidebar.contentDocument.getElementById("search-box").focus();
            // otherwise, attach an onload handler
            else
                sidebar.addEventListener("load", TooManySides.multiSidebarAsyncFocusSearchBox, true);
        }
    },

    closeSidebarByPosition: function (position) {
        var sidebarId;
        var sidebarBoxId;
        var sidebarTitleId;
        var sidebarSplitterId;

        if (position > 1) {
            sidebarId = "sidebar-" + position;
            sidebarBoxId = "sidebar-" + position + "-box";
            sidebarTitleId = "sidebar-" + position + "-title";
            sidebarSplitterId = "sidebar-" + position + "-splitter";
        } else {
            sidebarId = "sidebar";
            sidebarBoxId = "sidebar-box";
            sidebarTitleId = "sidebar-title";
            sidebarSplitterId = "sidebar-splitter";
        }

        var sidebar = document.getElementById(sidebarId);
        var sidebarBox = document.getElementById(sidebarBoxId);

        if (sidebarBox.hidden || sidebarBox.collapsed)
            return;

        var elt = document.getElementById(sidebarBox.getAttribute("sidebarcommand"));
        var sidebarTitle = document.getElementById(sidebarTitleId);
        var sidebarSplitter = document.getElementById(sidebarSplitterId);

        elt.removeAttribute("checked");
        sidebarBox.setAttribute("sidebarcommand", "");
        sidebarTitle.setAttribute("value", "");
        if (TooManySides.aiosCollapse) {
            sidebarBox.collapsed = true;
        } else {
            sidebarBox.hidden = true;
            sidebar.setAttribute("src", "about:blank");
        }
        sidebarSplitter.hidden = true;
        content.focus();
    },

    multiSidebarAsyncFocusSearchBox: function (event) {
        var sidebar = event.currentTarget;
        var searchBox = sidebar.contentDocument.getElementById("search-box");
        if (searchBox)
            searchBox.focus();
        sidebar.removeEventListener("load", TooManySides.multiSidebarAsyncFocusSearchBox, true);
    },

    getSidebarIdPopup: function (targetNode) {
        if (!targetNode)
            targetNode = document.popupNode;

        var targetSidebarId = targetNode.getAttribute("observes");

        if (!targetSidebarId && targetNode.hasAttribute("local_install") && targetNode.getAttribute("local_install")) {
            switch (targetNode.id) {
            case 'emSidebar':
                targetSidebarId = "extensionsEMbSidebar";
                break;
            case 'tmSidebar':
                targetSidebarId = "themesEMbSidebar";
                break;
            case 'myConfigSidebar':
                targetSidebarId = "myConfigSidebar";
                break;
            }
        }

        if (!targetSidebarId) {
            var currentNode = targetNode;
            while (currentNode.parentNode && currentNode.hasAttribute && !currentNode.hasAttribute("sidebarcommand")) {
                currentNode = currentNode.parentNode;
            }
            if (currentNode.hasAttribute("sidebarcommand")) {
                targetSidebarId = currentNode.getAttribute("sidebarcommand");
            }
        }
        return targetSidebarId;
    },

    fillTooltip: function () {
        // Don't show tooltip if AIOS is active
        if (typeof aios_initSidebar == "function")
            return false;

        var targetSidebarId = TooManySides.getSidebarIdPopup(document.tooltipNode);

        if (!targetSidebarId)
            return false;

        var toomanysidesBundle = document.getElementById("bundle_toomanysidesOverlay");
        var tooltipText = document.getElementById("toomanysidesTooltipText");

        if (prefs.prefHasUserValue("extensions.toomanysides." + targetSidebarId)) {
            var currentValue = prefs.getIntPref("extensions.toomanysides." + targetSidebarId);
            if (currentValue == 2) {
                tooltipText.value = toomanysidesBundle.getString("rightSidebarTooltip");
            } else if (currentValue == 3) {
                tooltipText.value = toomanysidesBundle.getString("topSidebarTooltip");
            } else if (currentValue == 4) {
                tooltipText.value = toomanysidesBundle.getString("bottomSidebarTooltip");
            } else {
                tooltipText.value = toomanysidesBundle.getString("leftSidebarTooltip");
            }
        } else {
            tooltipText.value = toomanysidesBundle.getString("defaultSidebarTooltip");
        }
        return true;
    },

    popupShowing: function (e) {
        var targetSidebarId = TooManySides.getSidebarIdPopup();

        if (!targetSidebarId)
            return false;

        // Reset checked attributes
        var menuItems = e.target.childNodes;
        for (var c = 0; c < menuItems.length; c++) {
            if (menuItems[c].hasAttribute("checked")) {
                menuItems[c].removeAttribute("checked");
            }
        }

        // Reset checkboxes
        document.getElementById("toomanysidesLeftMenuItem").setAttribute("checked", "false");
        document.getElementById("toomanysidesRightMenuItem").setAttribute("checked", "false");
        document.getElementById("toomanysidesTopMenuItem").setAttribute("checked", "false");
        document.getElementById("toomanysidesBottomMenuItem").setAttribute("checked", "false");

        // Check if preference exists
        if (prefs.prefHasUserValue("extensions.toomanysides." + targetSidebarId)) {
            var currentValue = prefs.getIntPref("extensions.toomanysides." + targetSidebarId);
            if (currentValue == 2) {
                document.getElementById("toomanysidesRightMenuItem").setAttribute("checked", "true");
            } else if (currentValue == 3) {
                document.getElementById("toomanysidesTopMenuItem").setAttribute("checked", "true");
            } else if (currentValue == 4) {
                document.getElementById("toomanysidesBottomMenuItem").setAttribute("checked", "true");
            } else {
                document.getElementById("toomanysidesLeftMenuItem").setAttribute("checked", "true");
            }
            document.getElementById("toomanysidesResetDefaultSeparator").hidden = false;
            document.getElementById("toomanysidesResetDefaultMenuItem").hidden = false;
        } else {
            switch (defaultPosition) {
            case 2:
                document.getElementById("toomanysidesRightMenuItem").setAttribute("checked", "true");
                break;
            case 3:
                document.getElementById("toomanysidesTopMenuItem").setAttribute("checked", "true");
                break;
            case 4:
                document.getElementById("toomanysidesBottomMenuItem").setAttribute("checked", "true");
                break;
            default:
                document.getElementById("toomanysidesLeftMenuItem").setAttribute("checked", "true");
                break;
            }
            document.getElementById("toomanysidesResetDefaultSeparator").hidden = true;
            document.getElementById("toomanysidesResetDefaultMenuItem").hidden = true;
        }

        return true;
    },

    toggleAction: function (e) {
        var targetSidebarId = TooManySides.getSidebarIdPopup();

        if (!targetSidebarId)
            return;

        toggleSidebar(targetSidebarId);
    },

    changePositionAction: function (number) {
        var targetSidebarId = TooManySides.getSidebarIdPopup();

        if (targetSidebarId) {
            if ((number >= 1) && (number <= 4)) {
                prefs.setIntPref("extensions.toomanysides." + targetSidebarId, number);
            } else {
                prefs.clearUserPref("extensions.toomanysides." + targetSidebarId);
            }
        }
    },

    resetDefaultAction: function () {
        var targetSidebarId = TooManySides.getSidebarIdPopup();

        if (targetSidebarId) {
            if (prefs.prefHasUserValue("extensions.toomanysides." + targetSidebarId)) {
                prefs.clearUserPref("extensions.toomanysides." + targetSidebarId);
            }
        }
    }
};

window.addEventListener("load", function (e) {
    TooManySides.init();
}, false);
window.addEventListener("unload", function (e) {
    TooManySides.unload();
}, false);
