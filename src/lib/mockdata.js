const mockData = {
  goPremium: false,
  takeSurvey: true,
  plan: "FREE",
  safes: [
    {
      name: "Mock Safe",
      id: 1,
      path: ["Mock Safe"],
      items: [],
      folders: [
        {
          SafeID: 1,
          id: "f1",
          path: ["Mock Safe", "Mock Folder"],
          name: "Mock Folder",
          cleartext: ["Mock Folder"],
          parent: 0,
          folders: [],
          lastModified: "2021-08-27T02:01:20+00:00",
          items: [
            {
              SafeID: 1,
              folder: "f1",
              _id:"f1i1",
              cleartext: [
                "Gmail",
                "alice",
                "kjhgqw",
                "https://gmail.com",
                "Work mail",
              ],
              path: ["Mock Safe", "Mock Folder"],
              lastModified: "2021-08-27T02:01:20+00:00",
            },
            {
              SafeID: 1,
              folder: "f1",
              _id:"f1i2",
              cleartext: [
                "Note",
                "alice",
                "",
                "",
                "Work mail\r\n kj skajhdah skdal fklasjh ljkah lkjdsh kljdh afljksdh fkljas hfjkdsh afjkah ldh",
              ],
              note:1,
              path: ["Mock Safe", "Mock Folder"],
              lastModified: "2021-08-27T02:01:20+00:00",
            },

          ],
        },
      ],
    },

    //-------------------------------
    {
      name: "Private",
      id: "sp52",
      path: ["Private"],
      items: [
        {
          SafeID: 2,
          folder: 0,
          _id:"2i1",
          cleartext: [
            "Gmail",
            "alice",
            "kjhgqw",
            "https://gmail.com",
            "Work mail",
          ],
          path: ["Private", ],
          lastModified: "2021-08-27T02:01:20+00:00",
        },
        {
          SafeID: 2,
          folder: 0,
          _id:"2i2",
          cleartext: [
            "long username",
            "alicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealice",
            "",
            "",
            "Work mail",
          ],
          path: ["Private", ],
          lastModified: "2021-08-27T02:01:20+00:00",
        },
        {
          SafeID: 2,
          folder: 0,
          _id:"2i3",
          cleartext: [
            "long password",
            "",
            "kjhgqwkjhgqwkjhgqwkjhgqwkjhgqwkjhgqwkjhgqwkjhgqwkjhgqwkjhgqwkjhgqwkjhgqwkjhgqwkjhgqwkjhgqwk",
            "https://gmail.com",
            "Work mail",
          ],
          path: ["Private", ],
          lastModified: "2021-08-27T02:01:20+00:00",
        },
        {
          SafeID: 2,
          folder: 0,
          _id:"2i4",

          cleartext: [
            "long url",
            "alice",
            "kjhgqw",
            "https://longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonggmail.com",
            "Work mail",
          ],
          path: ["Private", ],
          lastModified: "2021-08-27T02:01:20+00:00",
        },
        {
          SafeID: 2,
          folder: 0,
          _id:"2i5",

          cleartext: [
            "Gmail",
            "alice",
            "kjhgqw",
            "https://gmail.com",
            "Work mail",
          ],
          path: ["Private", ],
          lastModified: "2021-08-27T02:01:20+00:00",
        },
        {
          SafeID: 2,
          folder: 0,
          _id:"2i6",
          cleartext: [
            "Gmail",
            "alice",
            "kjhgqw",
            "https://gmail.com",
            "Work mail",
          ],
          path: ["Private", ],
          lastModified: "2021-08-27T02:01:20+00:00",
        },
        {
          SafeID: 2,
          folder: 0,
          _id:"2i7",
          cleartext: [
            "Gmail",
            "alice",
            "kjhgqw",
            "https://gmail.com",
            "Work mail",
          ],
          path: ["Private", ],
          lastModified: "2021-08-27T02:01:20+00:00",
        },
        {
          SafeID: 2,
          folder: 0,
          _id:"2i8",
          cleartext: [
            "Gmail",
            "alice",
            "kjhgqw",
            "https://gmail.com",
            "Work mail",
          ],
          path: ["Private", ],
          lastModified: "2021-08-27T02:01:20+00:00",
        },
        {
          SafeID: 2,
          folder: 0,
          _id:"2i9",
          cleartext: [
            "Gmail",
            "alice",
            "kjhgqw",
            "https://gmail.com",
            "Work mail",
          ],
          path: ["Private", ],
          lastModified: "2021-08-27T02:01:20+00:00",
        },
        {
          SafeID: 2,
          folder: 0,
          _id:"2ia",
          cleartext: [
            "Gmail",
            "alice",
            "kjhgqw",
            "https://gmail.com",
            "Work mail",
          ],
          path: ["Private", ],
          lastModified: "2021-08-27T02:01:20+00:00",
        },
      ],
     // folders: []
  ///////////////////////////////
  
      folders: [
        {
          SafeID: 2,
          id: "f21",
          path: ["Private", "SubFolder"],
          name: "SubFolder",
          cleartext: ["SubFolder"],
          parent: 0,
          folders: [],
          items: [],
        },
        /*
        {
          SafeID: 2,
          id: "f22",
          path: ["Private", "SubFolder2"],
          name: "SubFolder2",
          cleartext: ["SubFolder2"],
          parent: 0,
          folders: [],
          items: [],
        },
        */

        {
          SafeID: 2,
          id: "f23",
          path: ["Private", "SubFolder3"],
          name: "SubFolder3",
          cleartext: ["SubFolder3"],
          parent: 0,
          folders: [],
          items: [],
        },
      ],

    },
    //------------------------------------------
    




    { name: "Work", id: 3, path: ["Work"], items: [], folders: [] },
    { name: "x1", id: 4, path: ["x1"], items: [], folders: [] },
    { name: "x2", id: 5, path: ["x2"], items: [], folders: [] },
    { name: "x3", id: 6, path: ["x3"], items: [], folders: [] },
    { name: "x4", id: 7, path: ["x4"], items: [], folders: [] },
    { name: "x5", id: 8, path: ["x5"], items: [], folders: [] },
    { name: "x6", id: 9, path: ["x6"], items: [], folders: [] },
    { name: "x7", id: 10, path: ["x7"], items: [], folders: [] },
    { name: "x8", id: 11, path: ["x8"], items: [], folders: [] },
    {
      name: "Cards",
      id: 12,
      path: ["Cards"],
      items: [
        {
          SafeID: 12,
          folder: 0,
          _id:"12i1",

          cleartext: [
            "card",
            "Card1",
            "first card",
            "3700 000000 00000",
            "Mike",
            "03",
            "2024",
            "777",
          ],
          version: 5,
          path: ["Cards"],
          lastModified: "2021-08-27T02:01:20+00:00",
        },
      ],
      folders: [],
    },
  ],
};

export default mockData;