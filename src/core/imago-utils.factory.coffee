class imagoUtils extends Factory

  constructor: ->

    return {
      KEYS:
        '16'  : 'onShift'
        '18'  : 'onAlt'
        '17'  : 'onCommand'
        '91'  : 'onCommand'
        '93'  : 'onCommand'
        '224' : 'onCommand'
        '13'  : 'onEnter'
        '32'  : 'onSpace'
        '37'  : 'onLeft'
        '38'  : 'onUp'
        '39'  : 'onRight'
        '40'  : 'onDown'
        '46'  : 'onDelete'
        '8'   : 'onBackspace'
        '9'   : 'onTab'
        '188' : 'onComma'
        '190' : 'onPeriod'
        '27'  : 'onEsc'
        '186' : 'onColon'
        '65'  : 'onA'
        '67'  : 'onC'
        '86'  : 'onV'
        '88'  : 'onX'
        '68'  : 'onD'
        '187' : 'onEqual'
        '189' : 'onMinus'

      SYMBOLS:
        EUR     : '&euro;'
        USD     : '$'
        YEN     : '&yen;'
        GBP     : '&pound;'
        GENERIC : '&curren;'

      CURRENCY_MAPPING:
        "United Arab Emirates"     : "AED"
        "Afghanistan"              : "AFN"
        "Albania"                  : "ALL"
        "Armenia"                  : "AMD"
        "Angola"                   : "AOA"
        "Argentina"                : "ARS"
        "Australia"                : "AUD"
        "Aruba"                    : "AWG"
        "Azerbaijan"               : "AZN"
        "Bosnia and Herzegovina"   : "BAM"
        "Barbados"                 : "BBD"
        "Bangladesh"               : "BDT"
        "Bulgaria"                 : "BGN"
        "Bahrain"                  : "BHD"
        "Burundi"                  : "BIF"
        "Bermuda"                  : "BMD"
        "Brunei"                   : "BND"
        "Bolivia"                  : "BOB"
        "Brazil"                   : "BRL"
        "Bahamas"                  : "BSD"
        "Bhutan"                   : "BTN"
        "Botswana"                 : "BWP"
        "Belarus"                  : "BYR"
        "Belize"                   : "BZD"
        "Canada"                   : "CAD"
        "Switzerland"              : "CHF"
        "Chile"                    : "CLP"
        "China"                    : "CNY"
        "Colombia"                 : "COP"
        "Costa Rica"               : "CRC"
        "Cuba Convertible"         : "CUC"
        "Cuba Peso"                : "CUP"
        "Cape Verde"               : "CVE"
        "Czech Republic"           : "CZK"
        "Djibouti"                 : "DJF"
        "Denmark"                  : "DKK"
        "Dominican Republic"       : "DOP"
        "Algeria"                  : "DZD"
        "Egypt"                    : "EGP"
        "Eritrea"                  : "ERN"
        "Ethiopia"                 : "ETB"
        "Autria"                   : "EUR"
        "Fiji"                     : "FJD"
        "United Kingdom"           : "GBP"
        "Georgia"                  : "GEL"
        "Guernsey"                 : "GGP"
        "Ghana"                    : "GHS"
        "Gibraltar"                : "GIP"
        "Gambia"                   : "GMD"
        "Guinea"                   : "GNF"
        "Guatemala"                : "GTQ"
        "Guyana"                   : "GYD"
        "Hong Kong"                : "HKD"
        "Honduras"                 : "HNL"
        "Croatia"                  : "HRK"
        "Haiti"                    : "HTG"
        "Hungary"                  : "HUF"
        "Indonesia"                : "IDR"
        "Israel"                   : "ILS"
        "Isle of Man"              : "IMP"
        "India"                    : "INR"
        "Iraq"                     : "IQD"
        "Iran"                     : "IRR"
        "Iceland"                  : "ISK"
        "Jersey"                   : "JEP"
        "Jamaica"                  : "JMD"
        "Jordan"                   : "JOD"
        "Japan"                    : "JPY"
        "Kenya"                    : "KES"
        "Kyrgyzstan"               : "KGS"
        "Cambodia"                 : "KHR"
        "Comoros"                  : "KMF"
        "North Korea"              : "KPW"
        "South Korea"              : "KRW"
        "Kuwait"                   : "KWD"
        "Cayman Islands"           : "KYD"
        "Kazakhstan"               : "KZT"
        "Laos"                     : "LAK"
        "Lebanon"                  : "LBP"
        "Sri Lanka"                : "LKR"
        "Liberia"                  : "LRD"
        "Lesotho"                  : "LSL"
        "Lithuania"                : "LTL"
        "Latvia"                   : "LVL"
        "Libya"                    : "LYD"
        "Morocco"                  : "MAD"
        "Moldova"                  : "MDL"
        "Madagascar"               : "MGA"
        "Macedonia"                : "MKD"
        "Mongolia"                 : "MNT"
        "Macau"                    : "MOP"
        "Mauritania"               : "MRO"
        "Mauritius"                : "MUR"
        "Malawi"                   : "MWK"
        "Mexico"                   : "MXN"
        "Malaysia"                 : "MYR"
        "Mozambique"               : "MZN"
        "Namibia"                  : "NAD"
        "Nigeria"                  : "NGN"
        "Nicaragua"                : "NIO"
        "Norway"                   : "NOK"
        "Nepal"                    : "NPR"
        "New Zealand"              : "NZD"
        "Oman"                     : "OMR"
        "Panama"                   : "PAB"
        "Peru"                     : "PEN"
        "Papua New Guinea"         : "PGK"
        "Philippines"              : "PHP"
        "Pakistan"                 : "PKR"
        "Poland"                   : "PLN"
        "Paraguay"                 : "PYG"
        "Qatar"                    : "QAR"
        "Romania"                  : "RON"
        "Serbia"                   : "RSD"
        "Russia"                   : "RUB"
        "Rwanda"                   : "RWF"
        "Saudi Arabia"             : "SAR"
        "Solomon Islands"          : "SBD"
        "Seychelles"               : "SCR"
        "Sudan"                    : "SDG"
        "Sweden"                   : "SEK"
        "Singapore"                : "SGD"
        "Saint Helena"             : "SHP"
        "Suriname"                 : "SRD"
        "El Salvador"              : "SVC"
        "Syria"                    : "SYP"
        "Swaziland"                : "SZL"
        "Thailand"                 : "THB"
        "Tajikistan"               : "TJS"
        "Turkmenistan"             : "TMT"
        "Tunisia"                  : "TND"
        "Tonga"                    : "TOP"
        "Turkey"                   : "TRY"
        "Trinidad and Tobago"      : "TTD"
        "Tuvalu"                   : "TVD"
        "Taiwan"                   : "TWD"
        "Tanzania"                 : "TZS"
        "Ukraine"                  : "UAH"
        "Uganda"                   : "UGX"
        "United States"            : "USD"
        "Uruguay"                  : "UYU"
        "Uzbekistan"               : "UZS"
        "Venezuela"                : "VEF"
        "Vietnam"                  : "VND"
        "Vanuatu"                  : "VUV"
        "Samoa"                    : "WST"
        "Yemen"                    : "YER"
        "South Africa"             : "ZAR"
        "Zambia"                   : "ZMW"
        "Zimbabwe"                 : "ZWD"
        # euro countries
        "Austria"                  : "EUR"
        "Belgium"                  : "EUR"
        "Bulgaria"                 : "EUR"
        "Croatia"                  : "EUR"
        "Cyprus"                   : "EUR"
        "Czech Republic"           : "EUR"
        "Denmark"                  : "EUR"
        "Estonia"                  : "EUR"
        "Finland"                  : "EUR"
        "France"                   : "EUR"
        "Germany"                  : "EUR"
        "Greece"                   : "EUR"
        "Hungary"                  : "EUR"
        "Ireland"                  : "EUR"
        "Italy"                    : "EUR"
        "Latvia"                   : "EUR"
        "Lithuania"                : "EUR"
        "Luxembourg"               : "EUR"
        "Malta"                    : "EUR"
        "Netherlands"              : "EUR"
        "Poland"                   : "EUR"
        "Portugal"                 : "EUR"
        "Romania"                  : "EUR"
        "Slovakia"                 : "EUR"
        "Slovenia"                 : "EUR"
        "Spain"                    : "EUR"
        "United Kingdom"           : "EUR"

      CODES:
        'Andorra' : 'AD'
        'United Arab Emirates' : 'AE'
        'Afghanistan' : 'AF'
        'Antigua and Barbuda' : 'AG'
        'Anguilla' : 'AI'
        'Albania' : 'AL'
        'Armenia' : 'AM'
        'Angola' : 'AO'
        'Antarctica' : 'AQ'
        'Argentina' : 'AR'
        'American Samoa' : 'AS'
        'Austria' : 'AT'
        'Australia' : 'AU'
        'Aruba' : 'AW'
        'Aland Islands' : 'AX'
        'Azerbaijan' : 'AZ'
        'Bosnia and Herzegovina' : 'BA'
        'Barbados' : 'BB'
        'Bangladesh' : 'BD'
        'Belgium' : 'BE'
        'Burkina Faso' : 'BF'
        'Bulgaria' : 'BG'
        'Bahrain' : 'BH'
        'Burundi' : 'BI'
        'Benin' : 'BJ'
        'Saint Barthelemy' : 'BL'
        'Bermuda' : 'BM'
        'Brunei' : 'BN'
        'Bolivia' : 'BO'
        'Bonaire' : 'BQ'
        'Brazil' : 'BR'
        'Bahamas' : 'BS'
        'Bhutan' : 'BT'
        'Bouvet' : 'BV'
        'Botswana' : 'BW'
        'Belarus' : 'BY'
        'Belize' : 'BZ'
        'Canada' : 'CA'
        'Cocos Islands' : 'CC'
        'Democratic Republic of the Congo' : 'CD'
        'Central African Republic' : 'CF'
        'Republic of the Congo' : 'CG'
        'Switzerland' : 'CH'
        'Ivory Coast' : 'CI'
        'Cook Islands' : 'CK'
        'Chile' : 'CL'
        'Cameroon' : 'CM'
        'China' : 'CN'
        'Colombia' : 'CO'
        'Costa Rica' : 'CR'
        'Cuba' : 'CU'
        'Cape Verde' : 'CV'
        'Curacao' : 'CW'
        'Christmas Island' : 'CX'
        'Cyprus' : 'CY'
        'Czech Republic' : 'CZ'
        'Germany' : 'DE'
        'Djibouti' : 'DJ'
        'Denmark' : 'DK'
        'Dominica' : 'DM'
        'Dominican Republic' : 'DO'
        'Algeria' : 'DZ'
        'Ecuador' : 'EC'
        'Estonia' : 'EE'
        'Egypt' : 'EG'
        'Western Sahara' : 'EH'
        'Eritrea' : 'ER'
        'Spain' : 'ES'
        'Ethiopia' : 'ET'
        'Finland' : 'FI'
        'Fiji' : 'FJ'
        'Falkland Islands' : 'FK'
        'Micronesia' : 'FM'
        'Faroe Islands' : 'FO'
        'France' : 'FR'
        'Gabon' : 'GA'
        'United Kingdom' : 'GB'
        'Great Britain'  : 'GB'
        'Grenada' : 'GD'
        'Georgia' : 'GE'
        'French Guiana' : 'GF'
        'Guernsey' : 'GG'
        'Ghana' : 'GH'
        'Gibraltar' : 'GI'
        'Greenland' : 'GL'
        'Gambia' : 'GM'
        'Guinea' : 'GN'
        'Guadeloupe' : 'GP'
        'Equatorial Guinea' : 'GQ'
        'Greece' : 'GR'
        'South Georgia and the South Sandwich Islands' : 'GS'
        'Guatemala' : 'GT'
        'Guam' : 'GU'
        'Guinea-Bissau' : 'GW'
        'Guyana' : 'GY'
        'Hong Kong' : 'HK'
        'Heard Island and McDonald Islands' : 'HM'
        'Honduras' : 'HN'
        'Croatia' : 'HR'
        'Haiti' : 'HT'
        'Hungary' : 'HU'
        'Indonesia' : 'ID'
        'Ireland' : 'IE'
        'Israel' : 'IL'
        'Isle of Man' : 'IM'
        'India' : 'IN'
        'British Indian Ocean Territory' : 'IO'
        'Iraq' : 'IQ'
        'Iran' : 'IR'
        'Iceland' : 'IS'
        'Italy' : 'IT'
        'Jersey' : 'JE'
        'Jamaica' : 'JM'
        'Jordan' : 'JO'
        'Japan' : 'JP'
        'Kenya' : 'KE'
        'Kyrgyzstan' : 'KG'
        'Cambodia' : 'KH'
        'Kiribati' : 'KI'
        'Comoros' : 'KM'
        'Saint Kitts and Nevis' : 'KN'
        'North Korea' : 'KP'
        'South Korea' : 'KR'
        'Kosovo' : 'XK'
        'Kuwait' : 'KW'
        'Cayman Islands' : 'KY'
        'Kazakhstan' : 'KZ'
        'Laos' : 'LA'
        'Lebanon' : 'LB'
        'Saint Lucia' : 'LC'
        'Liechtenstein' : 'LI'
        'Sri Lanka' : 'LK'
        'Liberia' : 'LR'
        'Lesotho' : 'LS'
        'Lithuania' : 'LT'
        'Luxembourg' : 'LU'
        'Latvia' : 'LV'
        'Libya' : 'LY'
        'Morocco' : 'MA'
        'Monaco' : 'MC'
        'Moldova' : 'MD'
        'Montenegro' : 'ME'
        'Saint Martin' : 'MF'
        'Madagascar' : 'MG'
        'Marshall Islands' : 'MH'
        'Macedonia' : 'MK'
        'Mali' : 'ML'
        'Myanmar' : 'MM'
        'Mongolia' : 'MN'
        'Macao' : 'MO'
        'Northern Mariana Islands' : 'MP'
        'Martinique' : 'MQ'
        'Mauritania' : 'MR'
        'Montserrat' : 'MS'
        'Malta' : 'MT'
        'Mauritius' : 'MU'
        'Maldives' : 'MV'
        'Malawi' : 'MW'
        'Mexico' : 'MX'
        'Malaysia' : 'MY'
        'Mozambique' : 'MZ'
        'Namibia' : 'NA'
        'New Caledonia' : 'NC'
        'Niger' : 'NE'
        'Norfolk Island' : 'NF'
        'Nigeria' : 'NG'
        'Nicaragua' : 'NI'
        'Netherlands' : 'NL'
        'Norway' : 'NO'
        'Nepal' : 'NP'
        'Nauru' : 'NR'
        'Niue' : 'NU'
        'New Zealand' : 'NZ'
        'Oman' : 'OM'
        'Panama' : 'PA'
        'Peru' : 'PE'
        'French Polynesia' : 'PF'
        'Papua New Guinea' : 'PG'
        'Philippines' : 'PH'
        'Pakistan' : 'PK'
        'Poland' : 'PL'
        'Saint Pierre and Miquelon' : 'PM'
        'Pitcairn' : 'PN'
        'Puerto Rico' : 'PR'
        'Palestinian Territory' : 'PS'
        'Portugal' : 'PT'
        'Palau' : 'PW'
        'Paraguay' : 'PY'
        'Qatar' : 'QA'
        'Reunion' : 'RE'
        'Romania' : 'RO'
        'Serbia' : 'RS'
        'Russia' : 'RU'
        'Rwanda' : 'RW'
        'Saudi Arabia' : 'SA'
        'Solomon Islands' : 'SB'
        'Seychelles' : 'SC'
        'Sudan' : 'SD'
        'South Sudan' : 'SS'
        'Sweden' : 'SE'
        'Singapore' : 'SG'
        'Saint Helena' : 'SH'
        'Slovenia' : 'SI'
        'Svalbard' : 'SJ'
        'Slovakia' : 'SK'
        'Sierra Leone' : 'SL'
        'San Marino' : 'SM'
        'Senegal' : 'SN'
        'Somalia' : 'SO'
        'Suriname' : 'SR'
        'Sao Tome and Principe' : 'ST'
        'El Salvador' : 'SV'
        'Sint Maarten' : 'SX'
        'Damascus' : 'SY'
        'Swaziland' : 'SZ'
        'Turks and Caicos Islands' : 'TC'
        'Chad' : 'TD'
        'French Southern Territories' : 'TF'
        'Togo' : 'TG'
        'Thailand' : 'TH'
        'Tajikistan' : 'TJ'
        'Tokelau' : 'TK'
        'East Timor' : 'TL'
        'Turkmenistan' : 'TM'
        'Tunisia' : 'TN'
        'Tonga' : 'TO'
        'Turkey' : 'TR'
        'Trinidad and Tobago' : 'TT'
        'Tuvalu' : 'TV'
        'Taiwan' : 'TW'
        'Tanzania' : 'TZ'
        'Ukraine' : 'UA'
        'Uganda' : 'UG'
        'United States Minor Outlying Islands' : 'UM'
        'United States' : 'US'
        'USA' : 'US'
        'United States of America' : 'US'
        'Uruguay' : 'UY'
        'Uzbekistan' : 'UZ'
        'Vatican' : 'VA'
        'Saint Vincent and the Grenadines' : 'VC'
        'Venezuela' : 'VE'
        'British Virgin Islands' : 'VG'
        'U.S. Virgin Islands' : 'VI'
        'Vietnam' : 'VN'
        'Vanuatu' : 'VU'
        'Wallis and Futuna' : 'WF'
        'Samoa' : 'WS'
        'Yemen' : 'YE'
        'Mayotte' : 'YT'
        'South Africa' : 'ZA'
        'Zambia' : 'ZM'
        'Zimbabwe' : 'ZW'
        'Serbia and Montenegro' : 'CS'

      COUNTRIES: ["United States", "Afghanistan","Aland Islands","Albania","Algeria","American Samoa","Andorra","Angola","Anguilla","Antarctica","Antigua and Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bonaire","Bosnia and Herzegovina","Botswana","Bouvet","Brazil","British Indian Ocean Territory","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central African Republic","Chad","Chile","China","Christmas Island","Cocos Islands","Colombia","Comoros","Cook Islands","Costa Rica","Croatia","Cuba","Curacao","Cyprus","Czech Republic","Damascus","Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic","East Timor","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Guiana","French Polynesia","French Southern Territories","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Great Britain","Greece","Greenland","Grenada","Guadeloupe","Guam","Guatemala","Guernsey","Guinea","Guinea-Bissau","Guyana","Haiti","Heard Island and McDonald Islands","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Ivory Coast","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macao","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Martinique","Mauritania","Mauritius","Mayotte","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Niue","Norfolk Island","North Korea","Northern Mariana Islands","Norway","Oman","Pakistan","Palau","Palestinian Territory","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Pitcairn","Poland","Portugal","Puerto Rico","Qatar","Republic of the Congo","Reunion","Romania","Russia","Rwanda","Saint Barthelemy","Saint Helena","Saint Kitts and Nevis","Saint Lucia","Saint Martin","Saint Pierre and Miquelon","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Scotland","Senegal","Serbia","Serbia and Montenegro","Seychelles","Sierra Leone","Singapore","Sint Maarten","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Georgia and the South Sandwich Islands","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Svalbard","Swaziland","Sweden","Switzerland","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Tokelau","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Turks and Caicos Islands","Tuvalu","U.S. Virgin Islands","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States Minor Outlying Islands","Uruguay","Uzbekistan","Vanuatu","Vatican","Venezuela","Vietnam","Wallis and Futuna","Western Sahara","Yemen","Zambia","Zimbabwe"]


      STATES:

        AUSTRALIA : [
          'ACT'
          'NSW'
          'NT'
          'SA'
          'TAS'
          'QLD'
          'VIC'
          'WA'
          ]

        CANADA : [
          'AB'
          'BC'
          'MB'
          'NB'
          'NL'
          'NS'
          'ON'
          'PE'
          'QC'
          'SK'
          ]

        USA : [
          'AL'
          'AK'
          'AS'
          'AZ'
          'CA'
          'CO'
          'CT'
          'DE'
          'DC'
          'FM'
          'FL'
          'AR'
          'GA'
          'GU'
          'HI'
          'ID'
          'IL'
          'IN'
          'IA'
          'KS'
          'KY'
          'LA'
          'ME'
          'MH'
          'MD'
          'MA'
          'MI'
          'MN'
          'MS'
          'MO'
          'MT'
          'NE'
          'NV'
          'NH'
          'NJ'
          'NM'
          'NY'
          'NC'
          'ND'
          'MP'
          'OH'
          'OK'
          'OR'
          'PW'
          'PA'
          'PR'
          'RI'
          'SC'
          'SD'
          'TN'
          'TX'
          'UT'
          'VT'
          'VI'
          'VA'
          'WA'
          'WV'
          'WI'
          'WY'
          ]

      CURRENCIES: [
        'AED'
        'AFN'
        'ALL'
        'AMD'
        'ANG'
        'AOA'
        'ARS'
        'AUD'
        'AWG'
        'AZN'
        'BAM'
        'BBD'
        'BDT'
        'BGN'
        'BHD'
        'BIF'
        'BMD'
        'BND'
        'BOB'
        'BOV'
        'BRL'
        'BSD'
        'BTN'
        'BWP'
        'BYR'
        'BZD'
        'CAD'
        'CDF'
        'CHE'
        'CHF'
        'CHW'
        'CLF'
        'CLP'
        'CNY'
        'COP'
        'COU'
        'CRC'
        'CUC'
        'CUP'
        'CVE'
        'CZK'
        'DJF'
        'DKK'
        'DOP'
        'DZD'
        'EGP'
        'ERN'
        'ETB'
        'EUR'
        'FJD'
        'FKP'
        'GBP'
        'GEL'
        'GHS'
        'GIP'
        'GMD'
        'GNF'
        'GTQ'
        'GYD'
        'HKD'
        'HNL'
        'HRK'
        'HTG'
        'HUF'
        'IDR'
        'ILS'
        'INR'
        'IQD'
        'IRR'
        'ISK'
        'JMD'
        'JOD'
        'JPY'
        'KES'
        'KGS'
        'KHR'
        'KMF'
        'KPW'
        'KRW'
        'KWD'
        'KYD'
        'KZT'
        'LAK'
        'LBP'
        'LKR'
        'LRD'
        'LSL'
        'LTL'
        'LYD'
        'MAD'
        'MDL'
        'MGA'
        'MKD'
        'MMK'
        'MNT'
        'MOP'
        'MRO'
        'MUR'
        'MVR'
        'MWK'
        'MXN'
        'MXV'
        'MYR'
        'MZN'
        'NAD'
        'NGN'
        'NIO'
        'NOK'
        'NPR'
        'NZD'
        'OMR'
        'PAB'
        'PEN'
        'PGK'
        'PHP'
        'PKR'
        'PLN'
        'PYG'
        'QAR'
        'RON'
        'RSD'
        'RUB'
        'RWF'
        'SAR'
        'SBD'
        'SCR'
        'SDG'
        'SEK'
        'SGD'
        'SHP'
        'SLL'
        'SOS'
        'SRD'
        'SSP'
        'STD'
        'SVC'
        'SYP'
        'SZL'
        'THB'
        'TJS'
        'TMT'
        'TND'
        'TOP'
        'TRY'
        'TTD'
        'TWD'
        'TZS'
        'UAH'
        'UGX'
        'USD'
        'USN'
        'USS'
        'UYI'
        'UYU'
        'UZS'
        'VEF'
        'VND'
        'VUV'
        'WST'
        'XAF'
        'XAG'
        'XAU'
        'XBA'
        'XBB'
        'XBC'
        'XBD'
        'XCD'
        'XDR'
        'XOF'
        'XPD'
        'XPF'
        'XPT'
        'XSU'
        'XTS'
        'XUA'
        'XXX'
        'YER'
        'ZAR'
        'ZMW'
        'ZWL'
      ]

      toType: (obj) ->
       ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()

      requestAnimationFrame: do ->
        request =
          window.requestAnimationFrame or
          window.webkitRequestAnimationFrame or
          window.mozRequestAnimationFrame or
          window.oRequestAnimationFrame or
          window.msRequestAnimationFrame or
          (callback) ->
            window.setTimeout(callback, 1000 / 60)

        (callback) ->
          request.call(window, callback)

      cookie: (name, value) ->
        unless value
          # get cookie
          for cookie in document.cookie.split(';')
            if cookie.indexOf(name) >= 0
              return cookie.split('=')[1]
          return false
        # set cookie
        document.cookie = "#{name}=#{value}; path=/"

      sha: ->
        text = ''
        possible = 'abcdefghijklmnopqrstuvwxyz0123456789'

        for i in [0..56]
          text += possible.charAt(Math.floor(Math.random() * possible.length))

        text

      uuid: ->
        S4 = ->
          (((1+Math.random())*0x10000)|0).toString(16).substring(1)

        (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4())

      urlify: (query) ->
        console.log 'urlify'

      queryfy: (url) ->
        query = []

        for filter in url.split('+')
          filter or= 'collection:/'

          facet = filter.split(':')
          key   = facet[0].toLowerCase()
          value = decodeURIComponent(facet[1] or '')

          facet = {}
          facet[key] = value
          query.push(facet)

        query

      pluralize: (str) ->
        str + 's'

      singularize: (str) ->
        str.replace(/s$/, '')

      titleCase: (str) ->
        return str if typeof str isnt 'string'
        str.charAt(0).toUpperCase() + str.slice(1)

      normalize: (s) ->
        return if typeof s isnt 'string'

        s = s.trim().toLowerCase()

        specialCharMapping =
          "ä": "ae"
          "ö": "oe"
          "ü": "ue"
          "&": "and"
          "ß": "ss"
          "@": "at"
          "/+": "and"

        s = s.replace(new RegExp(key, 'g'), value) for key, value of specialCharMapping

        _.deburr(s.
          #remove all punctuation and special characters
          replace(/[\.,#¡!?¿@$%\^&\*;:{}='`‘’“”„"~()\?><\[\]†‡‹›•™¦©®ª«»¬°¹²³µ¶·º℅ⁿ§¨‣‼№♠♣♦♥←→↑↓♀♂♩♪♬♭]/g, '').
          # replace every slash, underscore, overscore, space and backslash with '-'
          replace(/\/|\_|\‾|\ |\\/g, '-').
          # replace multiple occurences of - with one only -
          replace(/\-+/g, '-').
          # remove leading and trailing -
          replace(/^-|-$/g, '')
        )

      alphaNumSort: alphanum = (a, b) ->
        chunkify = (t) ->
          tz = []
          x = 0
          y = -1
          n = 0
          i = undefined
          j = undefined
          while i = (j = t.charAt(x++)).charCodeAt(0)
            m = (i is 46 or (i >= 48 and i <= 57))
            if m isnt n
              tz[++y] = ""
              n = m
            tz[y] += j
          tz
        aa = chunkify(a)
        bb = chunkify(b)
        x = 0
        while aa[x] and bb[x]
          if aa[x] isnt bb[x]
            c = Number(aa[x])
            d = Number(bb[x])
            if c is aa[x] and d is bb[x]
              return c - d
            else
              return (if (aa[x] > bb[x]) then 1 else -1)
          x++
        aa.length - bb.length

      isiOS: ->
        return !!navigator.userAgent.match(/iPad|iPhone|iPod/i)

      isiPad: ->
        return !!navigator.userAgent.match(/iPad/i)

      isiPhone: ->
        return !!navigator.userAgent.match(/iPhone/i)

      isiPod: ->
        return !!navigator.userAgent.match(/iPod/i)

      isChrome: ->
        return !!navigator.userAgent.match(/Chrome/i)

      isIE: ->
        return !!navigator.userAgent.match(/MSIE/i)

      isFirefox: ->
        return !!navigator.userAgent.match(/Firefox/i)

      isSafari: ->
        return !!navigator.userAgent.match(/Safari/i) and not @isChrome()

      isMobile: ->
        return !!navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)

      isAndroid: ->
        return !!navigator.userAgent.match(/Android/i)

      isEven: (n) ->
        return @isNumber(n) and (n % 2 is 0)

      isOdd: (n) ->
        return @isNumber(n) and (n % 2 is 1)

      isNumber: (n) ->
        return n is parseFloat(n)

      toFloat: (value, decimal=2) ->
        return value unless decimal
        value   = String(value).replace(/\D/g, '')
        floats  = value.slice(value.length - decimal)

        # add trailing zeros
        floats = '0' + floats while floats.length < decimal
        ints   = value.slice(0, value.length - decimal) or '0'

        return "#{ints}.#{floats}"

      formatCurrency: (number, c, d, t) ->
        `var t`
        `var d`
        `var c`
        n = number
        c = if isNaN(c = Math.abs(c)) then 2 else c
        d = if d == undefined then '.' else d
        t = if t == undefined then ',' else t
        s = if n < 0 then '-' else ''
        i = parseInt(n = Math.abs(+n or 0).toFixed(c)) + ''
        j = if (j = i.length) > 3 then j % 3 else 0
        s + (if j then i.substr(0, j) + t else '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (if c then d + Math.abs(n - i).toFixed(c).slice(2) else '')

      toPrice: (value, currency) ->
        price  = @toFloat(value).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
        symbol = @getCurrencySymbol(currency)
        "#{symbol} #{price}"

      isEmail: (value) ->
        pattern = ///^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$///
        return !!value.match(pattern)

      fireEvent: (name) ->
        if bowser.msie and Number(bowser.version) <= 11
          evt = document.createEvent(name)
          evt.initCustomEvent(name, false, false)
        else
          evt = new CustomEvent(name)
        window.dispatchEvent(evt)

      getKeyName: (e) ->
        KEYS[e.which]

      getURLParameter: (name) ->
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]")
        regex = new RegExp("[\\?&]" + name + "=([^&#]*)")
        results = regex.exec(location.search)
        (if not results? then "" else decodeURIComponent(results[1].replace(/\+/g, " ")))

      inUsa: (value) ->
        value?.toLowerCase() in ['usa', 'united states', 'united states of america']

      replaceNewLines: (msg) ->
        msg.replace(/(\r\n\r\n|\r\n|\n|\r)/gm, "<br>")

      getCurrencySymbol: (currency) ->
        @SYMBOLS[currency] or currency

      getCurrency: (country) ->
        CURRENCY_MAPPING[country]

      getCountryByCode: (code) ->
        return unless code
        code = code.toUpperCase()
        for key,value of @CODES
          if value is code
            return key
            break

      getCountryCodeByCountry: (country) ->
        return unless country
        for key,value of @CODES
          if key is country
            return value
            break

      includesTax: (currency) ->
        TAXINCLUDED =
          'USD' : false
        return false if TAXINCLUDED[currency] isnt undefined
        return true

      toArray: (elem) ->
        # type = imagoUtils.toType(elem)
        # return console.log 'Panel: no valid query' unless type in ['object', 'string', ' array']
        if angular.isArray(elem) then elem else [elem]

      getMeta: (asset, attribute) ->
        return console.log "This asset does not contain a #{attribute} attribute" unless asset.fields[attribute]
        return asset.fields[attribute].value

      isBaseString: (string = '') ->
        return !!string.match(@isBaseRegex)

      isBaseRegex: /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i

      renameKey: (oldName, newName, object) ->
        object[newName] = object[oldName]
        delete object[oldName]
        return object

    }
