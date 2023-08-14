function insertFolder(root, node) {
  for(const folder of root.folders) {
    if(folder.name == node.path[0]) {
      node.path.shift();
      insertFolder(folder, node);
      return;
    }
  }
  if(node.path.length == 1) { // leaf, 
    node.name = node.path[0];
    root.folders.push(node)
    return;
  }
  const newNode = {name: node.path[0], folders:[], items:[]}
  root.folders.push(newNode);
  node.path.shift();
  insertFolder(newNode, node);
  return;
}

function normalizeFolders(ifolders) {
  ifolders.sort((a,b) => a.name.localeCompare(b.name));
  const ofolders = {folders: []};
  for(let ifolder of ifolders) {
    ifolder.path = ifolder.name.split('/');
    insertFolder(ofolders, ifolder);

  }
  return ofolders;
}

function importJSON(text) {

  const ibj = JSON.parse(text);
  const obj  = {items: [], folders: [] }
  const folderMap =  {}
  try {
    for(const folder of ibj.folders) {
      const ofolder = {name: folder.name, id: folder.id, items:[], folders:[]}
      obj.folders.push(ofolder);
      folderMap[folder.id] = ofolder;
    }

    for(const item of ibj.items) {
      const otem = {}

      if(item.type == 1) {
        let url = "";
        if(Array.isArray(item.login.uris) && item.login.uris.length) {
          url = item.login.uris[0].uri;
        }
        otem.cleartext = [item.name, item.login.username, item.login.password, url, item.notes];
        if(item.login.totp) {
          otem.cleartext.push(item.login.totp.trim());
        }
        otem.options = {};
      }

      if(item.type == 2) {
        otem.cleartext = [item.name, "", "", "", item.notes];
        otem.options = {note:1};
      }

      if(item.type == 3) {  // card
        otem.cleartext = ["card", item.name, item.notes, item.card.number, item.card.cardholderName, item.card.expMonth, item.card.expYear, item.card.code];
        otem.options = {version:5};
      }

      if(item.folderId) {
        folderMap[item.folderId].items.push(otem);
      } else  {
        obj.items.push(otem);
      }
    }

    let x = normalizeFolders(obj.folders);

    return {folders: x.folders, items: obj.items}
  } catch(error) {
    console.log('caught', error)
  }
}

export default importJSON;


/* todo --           url = item.login.uris[0].uri; */