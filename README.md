# Smart Web History

Smart Web History is a small extension to get better and faster access to the browser history. It shows you all the domains you have visited, sorted per domain. In a second table you see all the pages/urls (or deep links) for the selected domain. So if you for example select the Youtube-domain, it shows you all the videos you have seen. Smart Web History is  available as Chrome and Edge extension.

The standard history function of chromium browsers saves all visits with 10 information fields per visit over a maximum period of 3 months. This app only saves the last visit with 4 information fields: the domain, title, url and date of the last visit. The resulting smaller database makes it possible to save urls over a much longer period of time (no limit). All the information is saved locally in the browser and can be exchanged with local data files (json-format).

## Features

- Improved web browser history with the urls sorted per domain.
- No restriction to the standard 3-month history, as visited domains/urls are saved in the browser.
- Fast find your domain or url with the Quick Search tool.
- Or find your url with the date picker.
- Favicons for all domains (if available) for quick recognition.
- Option to provide favorite domains (e.g. Wikipedia, Youtube) that will show up as icon in the toolbar.
- Option to provide specific domains that will be hidden.
- Export function: urls can be saved to a (json) file.
- Import function: urls can be imported from a (json) file.
- Keyboard support to navigate through the domains/pages or to select a url.
- Free and open source software. 
- No ads, banners, popups or cookies.

## Installation

Install the app from the [Microsoft Egde](https://microsoftedge.microsoft.com/addons/Microsoft-Edge-Extensions-Home) or [Google Chrome](https://chrome.google.com/webstore/category/extensions) web store. Make sure the app-icon is visible in the toolbar (Setting, Manage extensions). 

Or you can download the code from this website and place it in a folder. From Manage extensions select Load unpacked and select the folder with the code.

You can provide a keyboard shortcut to open the extension (in Manage extensions), e.g. Ctrl-Shft-H.

## Usage

If you open the app you see two tables with your web history. The first table shows the domains + a link to the last visited page (url) on that domain. You can navigate through the domains using the up, down, home, end and tab-button or with the mouse. The second table shows all the visited pages on the selected domain.

You can search by typing a (part of a) word in the Quick search input or by clicking on one of the buttons in the toolbar. With the date picker button you can search based on a date. Open the found page by clicking on the url or press Enter. The next time you open the app a button in the toolbar will be added for the opened domain. The last 4 selected domains are visible in that way.

Press Escape to set the focus on the Quick search input and another Escape to close the app.

## Settings

In the Settings menu you can download the complete database in json-format. This file can always be imported with the Import button. All duplicates will be filtered out.

By setting Auto close window, the app will be closed after you have opened a url. In the Format date input field you can specify the preferred date format, e.g. MM/DD/YYYY, D-MMM-YY, etcetera. See [string-format](https://day.js.org/docs/en/parse/string-format).

In the Favorite domains textarea you can give the domains that will be visible with an icon in the toolbar (one domain per line). In the Skip domains textarea you can provide the domains that you want to exclude in the table (one per line). You can also give a part of the domain: for example 'google' will filter out all domains with 'google' somewhere in the name.

Clicking the R-button will restore the default settings.

## Privacy Policy

- We do not collect information from users of our app or visitors of our site. 
- We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information. 
- We do not include or offer third-party products or services on our website. 
- We do not track any information. We do not allow third-party behavioral tracking. 
- We do not specifically market to children under the age of 13 years old.
