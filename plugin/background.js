let showStarTabs = false;
        

//maps for closing and hibernating tabs after certain limits reached
const tabsCode = new Map();
const tabCloseTime = new Map();
let currentTabId = null;
const time = 30; // time in seconds
const action = "null";

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
  