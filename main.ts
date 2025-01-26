
//%block="DataSerial"
//%color="#44d4ca"
//%icon="\uf187"
namespace dataserial {

    let cidk: { [key: string]: number } = {}

    //%block="$name"
    //%blockId=dataserial_indexkeyshadow
    //%blockHidden=true shim=TD_ID
    //%name.fieldEditor="autocomplete" name.fieldOptions.decompileLiterals=true
    //%name.fieldOptions.key="dataserialindexkey"
    export function _indexKeyShadow(name: string) {
        return name
    }

    //%blockid=dataserial_startindexkey
    //%block="set index in $name by $num"
    //%name.shadow="dataserial_indexkeyshadow" name.defl="myIdxKey"
    //%group="index key"
    //%weight=10
    export function setIdxKey(name: string, num: number) {
        cidk[name] = num
    }

    //%blockid=dataserial_getindexkey
    //%block="get $name from index key"
    //%name.shadow="dataserial_indexkeyshadow" name.defl="myIdxKey"
    //%group="index key"
    //%weight=5
    export function getIdxKey(name: string) {
        return cidk[name]
    }

    //%blockid=dataserial_writevalue
    //%block="write $strval"
    //%group="write and read"
    //%weight=10
    export function write(strval: string) {
        let oval = "", curc = ""
        for (let i = 0; i < strval.length; i++) {
            curc = strval.charAt(i)
            if ("\\|".includes(curc)) {
                oval = "" + oval + "\\"
            }
            oval = "" + oval + curc
        }
        oval = "" + oval + "|"
        return oval
    }

    //%blockid=dataserial_readvalue
    //%block="read $txt from idx key $name"
    //%name.shadow="dataserial_indexkeyshadow" name.defl="myIdxKey"
    //%group="write and read"
    //%weight=5
    export function read(txt: string, name: string) {
        if (cidk[name] == null) return "";
        let idx = cidk[name]
        let oval = "", curc = ""
        while (idx < txt.length) {
            curc = txt.charAt(idx)
            if ("|".includes(curc)) {
                break
            } else if ("\\".includes(curc)) {
                idx += 1
                curc = txt.charAt(idx)
            }
            oval = "" + oval + curc
            idx += 1
        }
        idx += 1, cidk[name] = idx
        return oval
    }

    function checkStrf2e(txt: string, fchr: string, lchr: string) {
        if (txt.substr(0, fchr.length) === fchr && txt.substr(Math.abs(txt.length - lchr.length), lchr.length) === lchr) return true;
        return false;
    }

    //%blockid=dataserial_savestrarray
    //%block="save string array $inputStrArr"
    //%group="array in string"
    //%weight=10
    export function saveStrArr(inputStrArr: string[]) {
        let outputStr = ""
        outputStr = "" + outputStr + write("[str<")
        let cval = ""
        let count = 1
        for (let val of inputStrArr) {
            if (cval.isEmpty()) {
                cval = val
            } else {
                if (cval == val) {
                    count += 1
                } else {
                    outputStr = "" + outputStr + write(count.toString())
                    outputStr = "" + outputStr + write(cval)
                    cval = val
                    count = 1
                }
            }
        }
        outputStr = "" + outputStr + write(count.toString())
        outputStr = "" + outputStr + write(cval)
        outputStr = "" + outputStr + write(">str]")
        return outputStr
    }

    //%blockid=dataserial_loadstrarray
    //%block="load string array $inputStr"
    //%group="array in string"
    //%weight=8
    export function loadStrArr(inputStr: string) {
        let outputStrArr: string[] = []
        setIdxKey("_StrArrData", 0)
        let val = read(inputStr, "_StrArrData")
        if (!(checkStrf2e(val, "[", "<"))) return [];
        let count = 0, countstr = ""
        while (getIdxKey("_StrArrData") < inputStr.length) {
            if (count <= 0) {
                countstr = read(inputStr, "_StrArrData")
                if (checkStrf2e(countstr, ">", "]")) break;
                count = parseInt(countstr)
                val = read(inputStr, "_StrArrData")
            }
            while (count > 0) {
                count -= 1
                outputStrArr.push(val)
            }
        }
        return outputStrArr
    }

    //%blockid=dataserial_savestrtablearray
    //%block="save string table array $inputStrArr"
    //%inputStrArr.shadow=variables_get inputStrArr.defl=StringTableArray
    //%group="array in string"
    //%weight=6
    export function saveStrTableArr(inputStrArr: string[][]) {
        let outputStr = ""
        outputStr = "" + outputStr + write("[str<")
        let cval = ""
        let count = 1, nv = 0
        for (let n = 0; n < inputStrArr.length; n++) {
            for (let val of inputStrArr[n]) {
                if (cval.isEmpty()) {
                    cval = val
                } else {
                    if (cval == val) {
                        count += 1
                    } else if (n !== nv) { nv = n; count = 1; cval = val } else {
                        outputStr = "" + outputStr + write(count.toString())
                        outputStr = "" + outputStr + write(cval)
                        cval = val
                        count = 1
                    }
                }
            }
            outputStr = "" + outputStr + write(count.toString())
            outputStr = "" + outputStr + write(cval)
            if (n < inputStrArr.length - 1) outputStr = "" + outputStr + write(">]str[<");
        }
        outputStr = "" + outputStr + write(">str]")
        return outputStr
    }

    //%blockid=dataserial_loadstrarray
    //%block="load string table array $inputStr"
    //%group="array in string"
    //%weight=4
    export function loadStrTableArr(inputStr: string) {
        let outputStrArr: string[][] = []
        setIdxKey("_StrArrData", 0)
        let val = read(inputStr, "_StrArrData")
        if (!(checkStrf2e(val, "[", "<"))) return [];
        outputStrArr.push([])
        let count = 0, countstr = "", cidx = outputStrArr.length - 1
        while (getIdxKey("_StrArrData") < inputStr.length) {
            if (count <= 0) {
                countstr = read(inputStr, "_StrArrData")
                if (checkStrf2e(countstr, ">]", "[<")) {
                    outputStrArr.push([])
                    cidx = outputStrArr.length - 1
                } else if (checkStrf2e(countstr, ">", "]")) { break; } else {
                    count = parseInt(countstr)
                    val = read(inputStr, "_StrArrData")
                }
            }
            while (count > 0) {
                count -= 1
                outputStrArr[cidx].push(val)
            }
        }
        return outputStrArr
    }
}
