{
  "targets": [
    {
      "target_name": "queryparser",
      "sources": [ "queryparser.cc" ],
      "include_dirs" : [
 	 			"libpg_query/include"
			],
      'conditions': [
        ['OS=="linux"', {
            "libraries": [ "-L<!(pwd)/libpg_query/linux", "-lpg_query" ]
        } ],
        ['OS=="mac"', {
          "libraries": [ "-L<!(pwd)/libpg_query/osx", "-lpg_query" ]
        } ],
        ['OS=="win"', { }]
      ]
    }
  ],
}
