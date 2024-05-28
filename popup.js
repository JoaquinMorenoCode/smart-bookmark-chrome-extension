let currentURL;
let currentTab, currentTabName;
let tabTitleElement = document.getElementById("tabName");
let tabIconElement = document.getElementById("tabIcon");

let pinnedTabs;

document.addEventListener('DOMContentLoaded', async () => {
  getCurrentTab();
  bookmarks = await fetchBookmarks();
  await drawTable();
})

const getCurrentTab = async () => {
  const tabs = await chrome.tabs.query({ currentWindow: true, active: true });
  currentTab = tabs[0];
  currentTabName = trimString(tabs[0].title, 25);
  currentURL = tabs[0].url;
  tabTitleElement.textContent = currentTabName;
  tabIconElement.setAttribute("src",currentTab.favIconUrl);
}

function clearStorage() {
  chrome.storage.local.clear();
}

//FETCH BOOKMARKS
const fetchBookmarks = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get("bookmarks", (obj) => {
      resolve(obj["bookmarks"] ? JSON.parse(obj["bookmarks"]) : []);
    });
  });
};
//ADD BOOKMARK
const addNewBookmark = () => {

  if (currentTab.url.includes("http") && !isBookmarkDuplicate(currentURL)) {

    const comment = "Cool Bookmark";
    const newBookmark = {
      title: currentTab.title,
      pageURL: currentURL,
      dueDate: new Date(),
      comment: comment,
      logo: currentTab.favIconUrl
    }
    chrome.storage.local.set({
      "bookmarks": JSON.stringify([...bookmarks, newBookmark].sort((a, b) => a.time - b.time))
    });
    drawTable();
  }
}

const removeBookmark = (url) => {

  updateBookmarks = bookmarks.filter(bookmark => { return bookmark.pageURL !== url; })
  console.log("updatedBookmarks", updateBookmarks);
  chrome.storage.local.set({
    "bookmarks": JSON.stringify(updateBookmarks.sort((a, b) => a.time - b.time))
  });
  drawTable();

}




//Set Event Listener - ADD BOOKMARK
let addButton = document.getElementById("addItem");
addButton.addEventListener("click", async () => {
  addNewBookmark();
  
});

//Set Event Listener - CLEAR CHROME STORAGE
let clearButton = document.getElementById("clearStorage");
clearButton.addEventListener("click", async () => {
  clearStorage();
  drawTable();
});

function trimString(string, maxLength) {
  if (typeof string === "string" && string.length > maxLength) {
    return string.slice(0, maxLength) + "...";
  }
  return string;

}

function isBookmarkDuplicate(url) {
  return bookmarks.some(bookmark => {

    return bookmark.pageURL == url;
  })

}





//Draw Table - TO BE REFACTORED WITH BOOTSTRAP

async function drawTable() {

  let table = document.getElementById("tableBody");
  table.innerHTML = "";

  bookmarks = await fetchBookmarks();

  for (let i = 0; i < bookmarks.length; i++) {

    tableRow = document.createElement("tr");
    let iconColumn = document.createElement("td");
    let titleColumn = document.createElement("td");
    let optionsColumn = document.createElement("td");
    let pageIcon = document.createElement("img");
    pageIcon.setAttribute("src", bookmarks[i].logo);
    iconColumn.appendChild(pageIcon);
    titleColumn.textContent = trimString(bookmarks[i].title, 25);

    let buttonDiv = document.createElement("div");
    buttonDiv.className = "d-flex justify-content-end";

    //Create DeleteBtn
    let deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-secondary rounded-end";
    deleteBtn.setAttribute("id", "delete" + i);
    deleteBtn.onclick = function () { removeBookmark(bookmarks[i].pageURL) };
    // deleteBtn.onclick = function() {removeBookmark(bookmarks[i].pageURL)};

    deleteBtn.innerHTML = '<i class="bi bi-trash-fill p-2"></i>';
    //Create Edit Btn
    let editBtn = document.createElement("button");
    editBtn.className = "btn btn-secondary rounded-start"
    editBtn.setAttribute("id", "edit" + i);
    editBtn.innerHTML = '<i class="bi bi-three-dots-vertical"></i>';
    buttonDiv.appendChild(editBtn);
    buttonDiv.appendChild(deleteBtn);
    optionsColumn.appendChild(buttonDiv);
    // buttonDiv.id = i;



    tableRow.appendChild(iconColumn);
    tableRow.appendChild(titleColumn);
    tableRow.appendChild(optionsColumn);


    table.appendChild(tableRow);

  }

}



