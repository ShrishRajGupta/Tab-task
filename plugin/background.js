let currentWindow = false;
const starTabs = new Map();
let showStarTabs = false;
        
const token ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjhlMzdkOTcwYTcyNmY4NjY2MTBiOTgiLCJlbWFpbCI6ImRlbW9ua2FtYWRvQG11emFuLmNvIiwidXNlcm5hbWUiOiJuZXp1a28tY2hhbiIsImlhdCI6MTcyMDg3MDA3OSwiZXhwIjoxNzIwODgwODc5fQ.nCY-IoPq_NARkniiMDn5AlQA2qc8r7stfXK0arvMRKU";

//maps for closing and hibernating tabs after certain limits reached
const tabsCode = new Map();
const tabCloseTime = new Map();
let currentTabId = null;
const time = 30; // time in seconds
const action = "null";

(async () => {
  chrome.runtime.onConnect.addListener(function (port) {
    console.assert(port.name === "tabify");
    port.onMessage.addListener(function (msg) {
      const { id } = msg;
      switch (id) {
        case 1:
          sendAllTabs(id);
          break;
        case 2:
          DeleteParticularTab(id, msg.tabId);
          break;
        case 3:
          PinParticularTab(id, msg.tabId);
          break;
        case 4:
          UnpinParticularTab(id, msg.tabId);
          break;
        case 5:
          DuplicateParticularTab(id, msg.tabId);
          break;
        case 7:
          changeActiveTab(id, msg.tabId, msg.windowId);
          break;
        case 8:
          ArrangeTabsInAlphabeticalOrder();
          break;
        case 9:
          closeAllTabsExcept(msg.tabId);
          break;
        case 12:
          removeDuplicateTabs(msg.tabs);
          break;
        case 13:
          changeCurrentWindowVariable(msg.value);
          break;
        case 14:
          sendCurrentWindowVariable();
          break;
        case 15:
          bookamarkParticularTab(msg.tabId);
          break;
        case 16:
          OpenTabInIncognitoMode(msg.tabId);
          break;
        case 17:
          OpenTabInNewWindow(msg.tabId);
          break;
        case 18:
          UnbookmarkTab(msg.tabUrl);
          break;
        case 19:
          starMarkATab(msg.tabId);
          break;
        case 20:
          starUnmarkAtab(msg.tabId);
          break;
        case 21:
          getStarTabVariable();
          break;
        case 22:
          setStarVariable(msg.value);
          break;
        case 23:
          createGroup(msg.groupName);
          break;
        case 24:
          getAllUserGroups();
          break;
        case 25:
          addTabToGroup(msg.tab, msg.groupId);
          break;
        case 26:
          getTabsOfGroup(msg.groupId);
          break;
        case 27:
          addTabToWorkingAreaByUrl(msg.url);
          break;
        case 28:
          deleteTabOfGroup(msg.tabId, msg.groupId);
          break;
        case 29:
          openAllGroupTabs(msg.groupId);
          break;
        case 30:
          deleteGroup(msg.groupId);
          break;
        case 31:
          addGroupUsingLink(msg.url);
          break;
        case 32:
          ArrangeTabsInAlphabeticalOrder();
          break;
        case 33:
          sortTabsByLastAccessed();
          break;
      }
    });

    //function for sending all tabs details to the content.js
    const sendAllTabs = async (id) => {
      if (currentWindow === false) {
        chrome.tabs.query({}, async function (tabs) {
          const modifiedTabs = await Promise.all(
            tabs.map(async (tab) => {
              //check for bookmarked
              const isTabBookMarked = await isTabBookmarked(tab.url);

              //chech for starMarked
              const isStarMarked = starTabs.has(tab.id);
              return { ...tab, isTabBookMarked, isStarMarked };
            })
          );
          const tabsData = {
            id: id,
            data: modifiedTabs,
          };
          port.postMessage(tabsData);
        });
      } else {
        chrome.tabs.query({ currentWindow: true }, async function (tabs) {
          const modifiedTabs = await Promise.all(
            tabs.map(async (tab) => {
              //check for bookmarked
              const isTabBookMarked = await isTabBookmarked(tab.url);

              //chech for starMarked
              const isStarMarked = starTabs.has(tab.id);
              return { ...tab, isTabBookMarked, isStarMarked };
            })
          );
          const tabsData = {
            id: id,
            data: modifiedTabs,
          };
          port.postMessage(tabsData);
        });
      }
    };

    //function for deleting the particular tab
    const DeleteParticularTab = (id, tabId) => {
      chrome.tabs.remove(tabId, function () {
        sendAllTabs(1);
      });
    };

    //function for Pinning the particular tab
    const PinParticularTab = (id, tabId) => {
      chrome.tabs.update(tabId, { pinned: true }, function (updatedTab) {
        sendAllTabs(1);
      });
    };

    //function for Unpinning the particular tab
    const UnpinParticularTab = (id, tabId) => {
      chrome.tabs.update(tabId, { pinned: false }, function (updatedTab) {
        sendAllTabs(1);
      });
    };

    //function for Duplicating the particular tab
    const DuplicateParticularTab = (id, tabId) => {
      chrome.tabs.get(tabId, function (tab) {
        if (tab) {
          chrome.tabs.create(
            { url: tab.url, active: false },
            function (duplicatedTab) {
              sendAllTabs(1);
            }
          );
        } else {
          console.error("Tab with ID " + tabId + " not found");
        }
      });
    };

    //function for Changing Active Tab
    const changeActiveTab = (id, tabId, windowId) => {
      console.log(windowId);
      chrome.windows.update(windowId, { focused: true });
      chrome.tabs.update(tabId, { active: true });
    };

    //fucntion for Arranging tabs in Alphabetical Order
    const ArrangeTabsInAlphabeticalOrder = () => {
      chrome.tabs.query({}, function (tabs) {
        tabs.sort(function (a, b) {
          return a.title.localeCompare(b.title);
        });

        tabs.forEach(function (tab, index) {
          chrome.tabs.move(tab.id, { index: index });
        });
        sendAllTabs(1);
      });
    };

    //function for Arranging tabs in LastAccessed Time
    const sortTabsByLastAccessed = () => {
      chrome.tabs.query({}, function (tabs) {
        tabs.sort((a, b) => b.lastAccessed - a.lastAccessed);

        tabs.forEach(function (tab, index) {
          chrome.tabs.move(tab.id, { index: index });
        });
        sendAllTabs(1);
      });
    };

    // Function to close all tabs except for a specific tab
    const closeAllTabsExcept = (tabIdToKeep) => {
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab) {
          if (tab.id !== tabIdToKeep) {
            chrome.tabs.remove(tab.id);
          }
        });
        closeExtensionMenu();
      });
    };

    //check if bookmarked
    const isTabBookmarked = (tabUrl) => {
      return new Promise((resolve, reject) => {
        chrome.bookmarks.search({ url: tabUrl }, (bookmarkNodes) => {
          const isTabBookMarked = bookmarkNodes.length > 0;
          resolve(isTabBookMarked);
        });
      });
    };

    // function to remove duplicate tabs
    const removeDuplicateTabs = (tabs) => {
      tabs.forEach(function (tab) {
        if (tab.duplicate) {
          chrome.tabs.remove(tab.id);
        }
      });
    };

    //function close Extension Menu
    const closeExtensionMenu = () => {
      const tabsData = {
        id: 10,
      };
      port.postMessage(tabsData);
    };

    //function to change currentWindowVariable
    const changeCurrentWindowVariable = (value) => {
      console.log(value);
      currentWindow = value;
      sendCurrentWindowVariable();
      sendAllTabs(1);
    };

    //function to send value of currentWindowVariable
    const sendCurrentWindowVariable = () => {
      const currentWindowdata = {
        id: 14,
        currentWindow: currentWindow,
      };
      port.postMessage(currentWindowdata);
    };

    //function for bookamarking a tab
    const bookamarkParticularTab = (tabId) => {
      chrome.tabs.get(tabId, function (tab) {
        if (tab) {
          chrome.bookmarks.create(
            { title: tab.title, url: tab.url },
            function (bookmark) {}
          );
          sendAllTabs(1);
        } else {
          console.error("Tab with ID " + tabId + " not found");
        }
      });
    };

    //open tab in new window
    const OpenTabInNewWindow = (tabId) => {
      chrome.tabs.get(tabId, function (tab) {
        if (tab) {
          chrome.windows.create({
            url: tab.url,
          });
        }
      });
    };

    //open tab in icognito mode
    const OpenTabInIncognitoMode = (tabId) => {
      chrome.tabs.get(tabId, function (tab) {
        if (tab) {
          chrome.windows.create(
            {
              url: tab.url,
              incognito: true,
            },
            function (newWindow) {}
          );
        }
      });
    };

    //unbook mark a tab
    const UnbookmarkTab = (tabUrl) => {
      chrome.bookmarks.search({ url: tabUrl }, function (bookmarks) {
        bookmarks.forEach(function (bookmark) {
          chrome.bookmarks.remove(bookmark.id, function () {
            console.log("Bookmark removed for tab:", tabId);
          });
        });
        sendAllTabs(1);
      });
    };

    //star marking a tab
    const starMarkATab = (tabId) => {
      starTabs.set(tabId, 1);
      sendAllTabs(1);
    };

    //star Unmarking a tab
    const starUnmarkAtab = (tabId) => {
      starTabs.delete(tabId);
      sendAllTabs(1);
    };

    //sending startab variable
    const getStarTabVariable = () => {
      const starTabVar = {
        id: 21,
        showStarTabs: showStarTabs,
      };
      port.postMessage(starTabVar);
    };

    //changing value of starVariable
    const setStarVariable = (value) => {
      showStarTabs = value;
      getStarTabVariable();
    };

    //add tab to working area by URL
    const addTabToWorkingAreaByUrl = (url) => {
      chrome.tabs.create({ url: url, active: false }, function (duplicatedTab) {
        sendAllTabs(1);
      });
    };

    //listening of new tabs
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
      if (changeInfo.status === "complete") {
        sendAllTabs(1);
      }
    });

    //listening of newly created or deleted tabs
    chrome.tabs.onCreated.addListener(() => sendAllTabs(1));
    chrome.tabs.onRemoved.addListener(() => sendAllTabs(1));
    chrome.tabs.onActivated.addListener(() => sendAllTabs(1));

    
  });
})();


//running an interval of 1s
if (action !== "null") setInterval(closingHibernatingAction, 1000);