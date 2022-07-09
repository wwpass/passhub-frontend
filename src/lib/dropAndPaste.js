import axios from "axios";
import { getApiUrl, getVerifier } from "./utils";
import * as passhubCrypto from "./crypto";
import { getFolderById } from "../lib/utils";


function moveItemFinalize(recordID, src_safe, dst_safe, dst_folder, item, operation) {
  return axios
    .post(`${getApiUrl()}move.php`, {
      verifier: getVerifier(),
      id: recordID,
      src_safe, //state.currentSafe.id,
      dst_safe,
      dst_folder,
      item,
      operation,
    })
    .then( response => {
      const result = response.data;
      if(result.status === "Ok") {
        return result.status;
      }
      throw new Error(result.status);
    });
}

function doMove(safes, node, item, operation) {
  const dstBinaryKey = node.safe ? node.safe.bstringKey : node.bstringKey;

  let dst_safe = node.id;
  let dstFolder = 0;
  if (node.safe) {
    dst_safe = node.safe.id;
    dstFolder = node.id;
  }
  let src_safe = item.SafeID;
  /// --->> if src == dst, do nothing

  return axios
    .post(`${getApiUrl()}move.php`, {
      verifier: getVerifier(),
      id: item._id,
      src_safe,
      dst_safe,
      operation,
      checkRights: true,
    })
    .then( response => {
      const result = response.data;
      if (result.status === "Ok") {
        if ("file" in item) {
          const srcSafe = getFolderById(safes, item.SafeID);

          let eItem = passhubCrypto.moveFile(
            item,
            srcSafe.bstringKey,
            dstBinaryKey
          );
          return moveItemFinalize(
            item._id,
            src_safe,
            dst_safe,
            dstFolder,
            eItem,
            operation
          );
        }
        let options = {};
        if (item.note) {
          options["note"] = item.note;
        } else if (item.version === 5) {
          options["version"] = item.version;
        }
        let eItem = passhubCrypto.encryptItem(
          item.cleartext,
          dstBinaryKey,
          options
        );

        return moveItemFinalize(
          item._id,
          src_safe,
          dst_safe,
          dstFolder,
          eItem,
          operation
        );
      }

      throw new Error(result.status);
    })
};

export {doMove};
