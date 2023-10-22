_default_settings = { //settings that are stored in localstorage
    screenx: 900, //position window
    screeny: 100,
    screenw: 935,
    screenh: 700,
    auto_close_window: true,
    fav_domains: ['youtube.com', 'spotify.com', 'wikipedia.org'],
    sel_domains: [], //domains that have been visited through this app
    skip_domains: ['chrome-extension','mail.google.com'], //skip these domains in domains table
    max_sel_domains: 6,
    date_format: 'YYYY-MM-DD'
};

_settings = JSON.parse(localStorage.getItem('settings'));
if (jQuery.isEmptyObject(_settings)) {
    _settings = _default_settings;
    localStorage.setItem('settings', JSON.stringify(_settings));
}

_gv = { //global variables
    last_domain_idx: 0,
    app_title: 'Smart Web History',
    table_with_focus: 'domain_rows',
    sel_domain: '',
    total_domains: 0,
    website: 'https://github.com/fsch0203/swh'
}

function init(){
    window.moveTo(_settings.screenx, _settings.screeny);
    self.resizeTo(_settings.screenw, _settings.screenh);
    $('title').html(_gv.app_title);
    $('#apptitle').html(_gv.app_title);
    date = dayjs().format('YYYY-MM-DD');
    $('#search_on_date').val(date);
    $('#search_on_date').attr('max',date); //prevent
    $('#quickFindInput').val('');
    if (_settings.fav_domains){
        var fd = _settings.fav_domains.join('\n');
    }
    $('#fav_domains_ta').val(fd);
    if (_settings.skip_domains){
        var fd = _settings.skip_domains.join('\n');
    }
    var manifestData = chrome.runtime.getManifest();
    $('#version').html(manifestData.version);
    $('#this-year').html(dayjs().format('YYYY'));
    $('#website').html(`<a href="${_gv.website}" target="_blank">${_gv.website}</a>`);
    $('#skip_domains_ta').val(fd);
    $('#date_format_input').val(_settings.date_format);
    $('#auto_close_window').prop('checked', _settings.auto_close_window);
}

function saveWindowPosition() { //activated after window resize
    _settings.screenx = window.screenX;
    _settings.screeny = window.screenY;
    _settings.screenw = window.outerWidth;
    _settings.screenh = window.outerHeight;
    let tableh = (_settings.screenh - 190) / 2;
    $('table').css('height', tableh);
    $('#domain_rows td.col_domain').css('width', (_settings.screenw - 230) * 1 / 3);
    $('#domain_rows td.col_domain').css('min-width', (_settings.screenw - 230) * 1 / 3);
    $('#domain_rows td.col_domain').css('max-width', (_settings.screenw - 230) * 1 / 3);
    $('#domain_rows td.col_title').css('width', (_settings.screenw - 230) * 2 / 3);
    $('#domain_rows td.col_title').css('min-width', (_settings.screenw - 230) * 2 / 3);
    $('#domain_rows td.col_title').css('max-width', (_settings.screenw - 230) * 2 / 3);
    $('#url_rows td.col_title').css('width', (_settings.screenw - 220));
    $('#url_rows td.col_title').css('min-width', (_settings.screenw - 220));
    $('#url_rows td.col_title').css('max-width', (_settings.screenw - 220));
    localStorage.setItem('settings', JSON.stringify(_settings));
}

function showDomainTable(domains) {
    rows = `
<thead>
    <tr>
        <th>Date</th>
        <th>F</th>
        <th>Domain</th>
        <th>Last url</th>
    </tr>
  </thead>
`
    if (!_settings.skip_domains){
        _settings = _default_settings;
        localStorage.setItem('settings', JSON.stringify(_settings));
    }
    for (let i = 0, ie = domains.length; i < ie; ++i) {
        var valid = true;
        _settings.skip_domains.forEach((skip_domain) => {
            if (domains[i].domain.indexOf(skip_domain) >= 0) { //e.g. if skip_domain is 'google.com' all subdomains of google.com will be skipped
                valid = false;
            }
        });
        if (valid) {
            date = date2LocalString(domains[i].date);
            let row = `
<tr>
    <td class="col_date">${date}</td>
    <td class="col_fav"><img height="16" width="16" src="http://www.google.com/s2/favicons?domain=http://${domains[i].domain}" /></td>
    <td class="col_domain">${domains[i].domain.substring(0, 40)}</td>
    <td class="col_title"><a href="${domains[i].url}" target="_blank">${domains[i].title}</a></td>
</tr>        
`
            rows += row;
        }
    }
    $('#domain_rows').html(rows);
    $('#count_domains').html(` (${domains.length}/${_gv.total_domains})`);
    if (domains.length < _gv.total_domains){
        $('#count_domains').addClass('highlight2')
    } else {
        $('#count_domains').removeClass('highlight2')
    }
    $('#domain_rows tr').eq(1).click();
}

function showUrlTable(selDomain) {
    const allUrls = JSON.parse(localStorage.getItem("allUrls"));
    selUrls = allUrls.filter(url => url.domain === selDomain);
    let n1 = selUrls.length;
    rows = `
<thead>
    <tr>
        <th>Date</th>
        <th>Visited urls at <span class="highlight2">${selDomain}</span></th>
    </tr>
  </thead>
`
    for (let i = 0, ie = selUrls.length; i < ie; ++i) {
        date = date2LocalString(selUrls[i].date);
        let row = `
<tr>
    <td class="col_date">${date}</td>
    <td class="col_title"><a href="${selUrls[i].url}" target="_blank">${selUrls[i].title}</a></td>
</tr>        
`
        rows += row;
    }
    $('#url_rows').html(rows);
    let selDomainImg = `<img height="24" width="24" src="https://www.google.com/s2/favicons?domain=${selDomain}&sz=128" />`
    $('#sel_domain_img').html(selDomainImg);
    $('#sel_domain').html(selDomain);
    $('#count_urls').html(`(${n1}/${allUrls.length})`);
}

function buildAllUrlList() {
    let allUrlsStored = JSON.parse(localStorage.getItem("allUrls")) || [];
    allUrlsStored.forEach(elm=>delete elm.vcnt); //TODO: remove line
    let lastDateStored = 0;
    let diff = 0; //time since last url was stored in local storage
    if (allUrlsStored.length > 0) {
        lastDateStored = allUrlsStored[0].date;
        let now = Date.now();
        let last = new Date(lastDateStored);
        diff = now - last;
    } else {
        diff = 1000 * 60 * 60 * 24 * 7 * 13; //13 weeks
    }
    let start_time = new Date().getTime() - diff;
    chrome.history.search({
            text: '', // Return every history item....
            maxResults: 10000,
            startTime: start_time
        },
        function (historyItems) { //get all new history items
            // console.log(`# new historyItems: ${historyItems.length}, since: ${date2LocalString(start_time)}`)
            let allUrlsNew = [];
            for (let i = 0; i < historyItems.length; ++i) {
                let url = historyItems[i].url;
                let domain = url.replace(/^(?:https?:\/\/)?((?:[^@\/\n]+@)?[^:\/\n]+).*/g, '$1');
                let title = historyItems[i].title;
                let date = new Date(historyItems[i].lastVisitTime);
                allUrlsNew.push({
                    'domain': domain,
                    'url': url,
                    'title': title,
                    'date': date
                });
            }
            allUrlsNew = allUrlsNew.concat(allUrlsStored);
            allUrlsNew = deduplicateUrls(allUrlsNew);
            allDomainsNew = deduplicateDomains(allUrlsNew);
            localStorage.setItem('allUrls', JSON.stringify(allUrlsNew));
            _gv.sel_domain = allDomainsNew[0].domain;
            _gv.total_domains = allDomainsNew.length;
            showDomainTable(allDomainsNew);
            showUrlTable(_gv.sel_domain);
        }
    );
    $('#quickFindInput').focus();
}

function buildToolBar(){
    if (_settings.fav_domains) {
        buttons = '';
        _settings.fav_domains.forEach(domain => {
            let button = `
<button name="${domain}" class="button button2 button_domain" type="button" title="${domain}">
    &nbsp;<img height="16" width="16" src="http://www.google.com/s2/favicons?domain=http://${domain}" />&nbsp;
</button>
            `;
            buttons += button;
        });
        $('#fav_domain_buttons').html(buttons);
    }
    if (_settings.sel_domains) {
        buttons = '';
        _settings.sel_domains.forEach(domain => {
            let button = `
<button name="${domain}" class="button button2 button_domain" type="button" title="${domain}">
    &nbsp;<img height="16" width="16" src="http://www.google.com/s2/favicons?domain=http://${domain}" />&nbsp;
</button>
            `;
            buttons += button;
        });
        $('#sel_domain_buttons').html(buttons);
        $('#quickFindInput').focus();
    }    
}

function deduplicateDomains(arr) {
    // https://stackoverflow.com/questions/2218999/how-to-remove-all-duplicates-from-an-array-of-objects/70406623#70406623
    arr = arr.filter((value, index, self) =>
        index === self.findIndex((t) => (
            t.domain === value.domain
        ))
    )
    return arr;
}

function deduplicateUrls(arr) {
    arr = arr.filter((value, index, self) =>
        index === self.findIndex((t) => (
            t.url === value.url || t.title === value.title
        ))
    );
    return arr;
}

function searchDomains(query) {
    let allUrls = JSON.parse(localStorage.getItem("allUrls"));
    let selUrls = allUrls.filter(url => url.title.indexOf(query) >= 0 || url.domain.indexOf(query) >= 0);
    let selDomains = deduplicateDomains(selUrls);
    showDomainTable(selDomains);
}

function searchDomainsBefore(diff) { //diff in days before now
    if (diff > 0){
        let allUrls = JSON.parse(localStorage.getItem("allUrls"));
        allDomains = deduplicateDomains(allUrls);
        if (allDomains){
            now = new Date();
            diff *= 1000 * 24 * 60 * 60;
            this_day = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`).getTime(); //today at 0.00h
            now = now.getTime();
            diff = diff + now - this_day - (1000 * 24 * 60 * 60);
            var histDate = new Date().getTime() - diff; //format epoch (1696255555278)
            selDomains = allDomains.filter(url => {
                urldate = new Date(url.date).getTime(); //epoch format
                return urldate < histDate;
            });
            showDomainTable(selDomains);
        }
    }
}

function downloadFileFromText(filename, content) {
    var a = document.createElement('a');
    var blob = new Blob([content], {
        type: "text/plain;charset=UTF-8"
    });
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click(); //this is probably the key - simulating a click on a download link
    delete a; // we don't need this anymore
}

function importUrls(Urls_from_file) {
    let storedUrls = JSON.parse(localStorage.getItem("allUrls"));
    allUrls = storedUrls.concat(Urls_from_file);
    allUrls.sort((a, b) => {
        let da = new Date(a.date),
            db = new Date(b.date);
        return db - da;
    });
    allUrls = deduplicateUrls(allUrls);
    localStorage.setItem('allUrls', JSON.stringify(allUrls));
    $("#popup-settings").hide();
    location.reload();
}

function date2LocalString(date) {
    let df =`${_settings.date_format} HH:mm`
    return dayjs(date).format(df);
}

function rememberSelUrl(url){ //remember the last selected urls as icons in toolbar
    const domain = url.replace(/^(?:https?:\/\/)?((?:[^@\/\n]+@)?[^:\/\n]+).*/g, '$1');
    const index = _settings.sel_domains.indexOf(domain); //check if domain is selected earlier
    if (index > -1) {
        _settings.sel_domains.splice(index, 1); // then remove (2nd parameter means remove one item only)
    }
    let check_fav = _settings.fav_domains.some(fav_domain => domain.includes(fav_domain)); //true if favorite is substring of domain
    if (!check_fav && !(domain == 'blob')) {
        _settings.sel_domains.unshift(domain);
    }
    if (_settings.sel_domains.length > _settings.max_sel_domains) {
        _settings.sel_domains.pop();
    }
    localStorage.setItem('settings', JSON.stringify(_settings));
    buildAllUrlList();
    return domain;
}



$(document).ready(function () {
    init();
    buildAllUrlList();
    buildToolBar();
    $('#quickFindInput').focus();
    $(window).on('resize', function () {
        saveWindowPosition()
    });

    $(document).on("click", "a", function () {
        const url = $(this).attr("href");
        domain = rememberSelUrl(url);
        if (_settings.auto_close_window == false || domain == 'blob' || url == _gv.website) {
            location.reload();
        } else {
            window.close();
        }
    });
    $('#url_rows').on('click', 'tr', function () {
        _gv.table_with_focus = 'url_rows'
        $("#domain_rows tr").removeClass("highlight");
        $("#url_rows tr").removeClass("highlight");
        $(this).addClass("highlight");
        let url = $(this).find('a').attr('href');
        saveWindowPosition()
    });
    $('#domain_rows').on('click', 'tr', function () {
        _gv.table_with_focus = 'domain_rows'
        $("#url_rows tr").removeClass("highlight");
        $("#domain_rows tr").removeClass("highlight");
        $(this).addClass("highlight");
        _gv.sel_domain = $(this).find('td.col_domain').html();
        showUrlTable(_gv.sel_domain);
        saveWindowPosition()
    });
    $('#auto_close_window').change(function() {
        if(this.checked) {
            _settings.auto_close_window = true;
        } else {
            _settings.auto_close_window = false;
        }
        saveWindowPosition()
        localStorage.setItem('settings', JSON.stringify(_settings));
    });
    $("#quickFindInput").on('input', function () {
        searchDomains($(this).val());
    });
    $("#date_format_input").on('input', function () {
        _settings.date_format = $(this).val();
        localStorage.setItem('settings', JSON.stringify(_settings));
    });
    $("#clear").on("click", function () {
        location.reload();
        $('.angry-grid').trigger('keypress', {which: 40}); //trigger down/ip
        $('.angry-grid').trigger('keypress', {which: 38});
    });
    $(".button_domain").on("click", function () {
        domain_name = $(this).attr('name');
        console.log(`${domain_name}`);
        searchDomains(domain_name);
    });
    $("#download").on("click", function () {
        let allUrls = localStorage.getItem("allUrls");
        date = dayjs().format('YYYY-MM-DDTHH_mm');
        downloadFileFromText(`${date} urls.json`, allUrls);
    });
    $("#open_file").on("click", function () {
        const pickerOpts = {
            types: [{
                description: "Urls-file",
                accept: {
                    "json/*": ".json",
                },
            }, ],
            excludeAcceptAllOption: true,
            multiple: false,
        };
        let fileHandle;
        async function openFilePick() {
            // open file picker, destructure the one element returned array
            [fileHandle] = await window.showOpenFilePicker(pickerOpts);
            const file = await fileHandle.getFile();
            const contents = await file.text();
            let contents_json = JSON.parse(contents);
            importUrls(contents_json);
        }
        openFilePick();
    });
    $("#restore_settings_btn").on("click", function () {
        _settings = _default_settings;
        localStorage.setItem('settings', JSON.stringify(_settings));
        $("#popup-settings").hide();
        location.reload();
    });
    $("#today-2").on("click", function () {
        searchDomainsBefore(2);
    });
    $("#go_settings_btn").on("click", function () {
        $("#popup-settings").show();
    });
    $("#close-modal").on("click", function () {
        $("#popup-settings").hide();
        let str = $('#fav_domains_ta').val();
        if (str.length > 0){
            _settings.fav_domains = str.split('\n');
        } else {
            _settings.fav_domains = [];
        }
        str = $('#skip_domains_ta').val();
        if (str.length > 0){
            _settings.skip_domains = str.split('\n');
        } else {
            _settings.skip_domains = [];
        }
        buildAllUrlList();
        buildToolBar();
        localStorage.setItem('settings', JSON.stringify(_settings));
    });
    $(window).on("click", function (e) {
        var modal =  document.getElementById("popup-settings");
        if (e.target == modal){
            $("#popup-settings").hide();
        }
    });
    $("#search_on_date").on('change', function () { 
        var input = this.value;
        today = dayjs().format('YYYY-MM-DD');
        date2 = new Date(today);
        date1 = new Date(input);
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        searchDomainsBefore(diffDays);
    }).trigger("change");
    $(document).on('keydown', function (e) {
        if (e.ctrlKey && e.which == 70)  { //Ctrl F
            $("#popup-settings").hide();
            e.preventDefault();
            $('#quickFindInput').focus();
            $('#quickFindInput').val('');
        }
        if (e.which == 27) { //escape
            e.preventDefault();
            if ($('#quickFindInput').is(":focus")) {
                if ($('#quickFindInput').val()) {
                    $('#quickFindInput').val('');
                    searchDomains('');
                } else {
                    window.close();
                }
            } else {
                $('#quickFindInput').focus();
                $('#quickFindInput').val('');
                searchDomains('');
            }
        }
    });
    $('.angry-grid').on('keydown', function (e) {
        if (e.which == 40) { // highlight go down
            if (_gv.table_with_focus == 'domain_rows') {
                var rows = $('#domain_rows tr')
            } else {
                var rows = $('#url_rows tr')
            }
            var current = rows.filter('.highlight').index();
            if (current >= rows.length - 2) return;
            rows.removeClass("highlight");
            rows.eq(current + 2).addClass('highlight');
            var current = rows.filter('.highlight').index();
            rows[current].scrollIntoView({
                block: 'center'
            });
            if (_gv.table_with_focus == 'domain_rows') {
                _gv.sel_domain = rows.eq(current + 1).find('td.col_domain').html();
                showUrlTable(_gv.sel_domain);
            };
        };
        if (e.which == 38) { // highlight go up
            if (_gv.table_with_focus == 'domain_rows') {
                var rows = $('#domain_rows tr')
            } else {
                var rows = $('#url_rows tr')
            }
            var current = rows.filter('.highlight').index();
            if (current == 0) return;
            rows.removeClass("highlight");
            rows.eq(current).addClass('highlight');
            rows[current].scrollIntoView({
                block: 'center'
            });
            if (_gv.table_with_focus == 'domain_rows') {
                _gv.sel_domain = rows.eq(current).find('td.col_domain').html();
                showUrlTable(_gv.sel_domain);
            }
        }
        if (e.which == 13) { //enter
            e.preventDefault();
            if (_gv.table_with_focus == 'domain_rows') {
                var rows = $('#domain_rows tr');
            } else if (_gv.table_with_focus == 'url_rows') {
                var rows = $('#url_rows tr');
            }
            let url = rows.filter('.highlight').find('a').attr('href');
            chrome.tabs.create({ // open url in new tab
                selected: true,
                url: url
            });
            domain = rememberSelUrl(url);
            if (_settings.auto_close_window == true) {
                window.close();
            } else {
                location.reload();
            }
        };
        if (e.which == 9) { //tab
            e.preventDefault();
            if (_gv.table_with_focus == 'domain_rows') { //switch between tables
                _gv.table_with_focus = 'url_rows';
                _gv.last_domain_idx = $('#domain_rows tr').filter('.highlight').index();
                $("#url_rows tr").removeClass("highlight");
                $("#domain_rows tr").removeClass("highlight");
                $('#url_rows tr').eq(1).addClass('highlight'); // go to first row
            } else if (_gv.table_with_focus == 'url_rows') {
                _gv.table_with_focus = 'domain_rows';
                $("#url_rows tr").removeClass("highlight");
                $("#domain_rows tr").removeClass("highlight");
                $('#domain_rows tr').eq(_gv.last_domain_idx+1).addClass('highlight'); // back to last row
            }
        }
        if (e.which == 36) { //home
            e.preventDefault();
            if (_gv.table_with_focus == 'domain_rows') {
                var rows = $('#domain_rows tr')
            } else {
                var rows = $('#url_rows tr')
            }
            $('#domain_rows').animate({
                scrollTop: 0
            }, 600);
            rows.removeClass("highlight");
            rows.eq(1).addClass('highlight');
            if (_gv.table_with_focus == 'domain_rows') {
                _gv.sel_domain = rows.eq(1).find("td").eq(2).html();
                showUrlTable(_gv.sel_domain);
            }
        }
        if (e.which == 35) { //end
            e.preventDefault();
            let table;
            if (_gv.table_with_focus == 'domain_rows') {
                table = $('#domain_rows');
            } else {
                table = $('#url_rows');
            }
            table.animate({
                scrollTop: 20000
            }, 600);
            table.find('tr').removeClass("highlight");
            let row = table.find('tr:last');
            row.addClass('highlight');
            if (_gv.table_with_focus == 'domain_rows') {
                _gv.sel_domain = row.find("td").eq(2).html();
                showUrlTable(_gv.sel_domain);
            }
        }
        saveWindowPosition()
    })
});



