# mat-facebook-downloader

Downloader for Facebook ads archive for Media Analytics Tool project.

## Development
### Installation & test run
```bash
git clone git@github.com:lvtffuk/mat-facebook-downloader.git
cd mat-facebook-downloader
npm install
npm start
```
## Settings
The settings are set with environment variables. 
Variable | Description | Required | Default value
:------------ | :-------------| :-------------| :-------------
`TOKENS_FILE_PATH` | The filepath of the `csv` file with access tokens. | :heavy_check_mark: | 
`SEARCH_INPUT_FILE_PATH` | The filepath of the `csv` file with search input data. | :heavy_check_mark: | 
`OUT_DIR` | The directory where the output is stored. | :heavy_check_mark: | 
`CSV_SEPARATOR` | The separator of the input `csv` files. | :x: | `;`
`WORKER_CONCURRENCY` | The count of parallel runs of the downloading ads archive. | :x: | `5`
`CLEAR` | Indicates if the output dir should be cleared before the run. All downloads are starting again. | :x: | `0`
`ADS_ARCHIVE_LIMIT` | The limit of the results in the Facebook API request. | :x: | `100`

## Input files
### Facebook tokens
For access to the Facebook Ads Library are needed access tokens allowed to read the ads [archive](https://www.facebook.com/ads/library/api).  
Additionally there should be Facebook application created.

The tokens must be stored in `csv` files. 
#### Example
```csv
"id";"secret";"token"
"appId";"appSecret";"accessToken"
"appId";"appSecret";"accessToken"
"appId";"appSecret";"accessToken"
"appId";"appSecret";"accessToken"
```
First line is header.  
The `appId` and `appSecret` can be retrieved from the developers [console](https://developers.facebook.com/apps).  
The access token can be retrieved from the [Graph API Explorer](https://developers.facebook.com/tools/explorer/). The user must log in the correct app.

### Search input
The search input is `csv` file which contains information about the data to search.
#### Example
```csv
"countries";"search"
"countries";"searchTerm"
"countries";"searchTerm"
"countries";"searchTerm"
"countries";"searchTerm"
"countries";"searchTerm"
```
First line is header.  
The `countries` are comma separated country codes and `searchTerm` is the term to search in archive.

## Output
The output is stored in `Apache Parquet` file in the output directory as `archive.parquet`.

## Docker
The [image](https://github.com/lvtffuk/mat-facebook-downloader/pkgs/container/mat-facebook-downloader) is stored in GitHub packages registry and the app can be run in the docker environment.
```bash
docker pull ghcr.io/lvtffuk/mat-facebook-downloader:latest
```

```bash
docker run \
--name=mat-facebook-downloader \
-e 'TOKENS_FILE_PATH=./input/tokens.csv' \
-e 'SEARCH_INPUT_FILE_PATH=./input/search.csv' \
-e 'OUT_DIR=./output' \
-v '/absolute/path/to/output/dir:/usr/src/app/output' \
-v '/absolute/path/to/input/dir:/usr/src/app/input' \
ghcr.io/lvtffuk/mat-facebook-downloader:latest  
```
The volumes must be set for accessing input and output data.

*This work was supported by the European Regional Development Fund-Project “Creativity and Adaptability as Conditions of the Success of Europe in an Interrelated World” (No. CZ.02.1.01/0.0/0.0/16_019/0000734)."*
![Logo](logolink_OP_VVV_hor_cb_eng.jpg?raw=true "Logo")
