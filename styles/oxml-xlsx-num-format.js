define(['utils'], function (utils) {
    var generateContent = function (_styles) {
        var stylesString = '';
        if (_styles._numFormats) {
            stylesString += '<numFmts count="' + Object.keys(_styles._numFormats).length + '">';
            var numFormatKey;
            for (numFormatKey in _styles._numFormats) {
                var numFormat = JSON.parse(numFormatKey);
                stylesString += '<numFmt numFmtId="' + _styles._numFormats[numFormatKey] + '" formatCode="' + numFormat.formatString + '"/>';
            }
            stylesString += '</numFmts>';
        }
        return stylesString;
    };

    var createNumFormat = function (options) {
        var numberFormat = {};
        numberFormat.formatString = options.numberFormat;
        return numberFormat;
    };

    var searchNumFormat = function (numFormat, _styles) {
        return _styles._numFormats[utils.stringify(numFormat)];
    };

    var addNumFormat = function (numFormat, _styles) {
        if (!_styles._numFormats) {
            _styles._numFormats = {};
            _styles._numFormatsCount = 200;
        }
        var index = _styles._numFormatsCount++;
        _styles._numFormats[utils.stringify(numFormat)] = "" + index;
        return _styles._numFormats[utils.stringify(numFormat)];
    };

    var updateNumFormat = function (numFormat, savedNumFormat, _styles) {
        var savedNumFormatDetails;
        for (var key in _styles._numFormats) {
            if (_styles._numFormats[key] === savedNumFormat) {
                savedNumFormatDetails = JSON.parse(key);
                break;
            }
        }
        if (numFormat.formatString) {
            delete _styles._numFormats[utils.stringify(savedNumFormatDetails)];
            _styles._numFormats[utils.stringify(numFormat)] = savedNumFormat;
        } else {
            numFormat.formatString = savedNumFormatDetails.formatString;
        }
        return savedNumFormat;
    };

    var getNumFormatCounts = function (numFormat, _styles) {
        var count = 0, index;
        for (index = 0; index < _styles.styles.length; index++) {
            if (_styles.styles[index]._numFormat === numFormat) {
                count += Object.keys(_styles.styles[index].cellIndices).length;
                if (count > 1)
                    return count;
            }
        }
        return count;
    };

    var searchSavedNumFormatForUpdate = function (_styles, cellIndices) {
        var index = 0, numFormatCount = 0;
        var cellStyle;
        for (var index2 = 0; index2 < cellIndices.length; index2++) {
            var cellIndex = cellIndices[0];
            for (; index < _styles.styles.length; index++) {
                if (_styles.styles[index].cellIndices[cellIndex] !== undefined || _styles.styles[index].cellIndices[cellIndex] !== null) {
                    cellStyle = _styles.styles[index];
                    numFormatCount++;
                    if (Object.keys(cellStyle.cellIndices).length !== cellIndices.length || numFormatCount > 1) {
                        return false;
                    }
                }
            }
        }
        if (!cellStyle)
            return false;
        return cellStyle._numFormat;
    };

    var getNumFormatForCells = function (_styles, options) {
        var newStyleCreated = false, numFormat = createNumFormat(options), numFormatIndex;
        var savedNumFormat = _styles._numFormats ? searchNumFormat(numFormat, _styles) : null;
        if (savedNumFormat !== undefined && savedNumFormat !== null) {
            numFormatIndex = savedNumFormat;
        } else if (numFormat.formatString) {
            newStyleCreated = true;
        }
        if (!numFormatIndex) {
            savedNumFormat = searchSavedNumFormatForUpdate(_styles, options.cellIndices);
            if (savedNumFormat !== false) {
                numFormatIndex = updateNumFormat(numFormat, savedNumFormat, _styles);
            }
        }
        if ((numFormatIndex === undefined || numFormatIndex === null) && numFormat.formatString)
            numFormatIndex = addNumFormat(numFormat, _styles);

        return {
            numFormat: numFormat,
            numFormatIndex: numFormatIndex || false,
            newStyleCreated: newStyleCreated
        };
    };

    var getNumFormatForCell = function (_styles, options, cellStyle) {
        // Create Num Format Object
        var newStyleCreated = false, numFormat = createNumFormat(options), numFormatIndex;
        var savedNumFormat = _styles._numFormats ? searchNumFormat(numFormat, _styles) : null;
        if (savedNumFormat !== undefined && savedNumFormat !== null) {
            numFormatIndex = savedNumFormat;
        } else if (numFormat.formatString) {
            // Check if num format can be updated
            newStyleCreated = true;
        }
        if (cellStyle && cellStyle._numFormat) {
            var numFormatCount = getNumFormatCounts(cellStyle._numFormat, _styles);
            if (numFormatCount <= 1 && _styles._numFormats) {
                // Update num format
                numFormatIndex = updateNumFormat(numFormat, cellStyle._numFormat, _styles);
            }
        }
        if ((numFormatIndex === undefined || numFormatIndex === null) && numFormat.formatString)
            numFormatIndex = addNumFormat(numFormat, _styles);


        return {
            numFormat: numFormat,
            numFormatIndex: numFormatIndex || false,
            newStyleCreated: newStyleCreated
        };
    };

    return {
        generateContent: generateContent,
        getNumFormatForCell: getNumFormatForCell,
        getNumFormatForCells: getNumFormatForCells
    };
});