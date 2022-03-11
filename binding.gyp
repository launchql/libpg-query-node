{
  "targets": [
    {
      "target_name": "queryparser",
      "sources": [
        "src/addon.cc",
        "src/helpers.cc",
        "src/sync.cc",
        "src/async.cc"
      ],
      "actions": [
        {
          "outputs": ['libpg_query/include/pg_query.h'],
          "inputs": [],
          "action": ['script/buildAddon.sh'],
          "action_name": 'prebuild_dependencies'
        }
      ],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      'include_dirs': [
        "libpg_query/include",
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'dependencies': ["<!(node -p \"require('node-addon-api').gyp\")"],
      'conditions': [
        ['OS=="linux"', {
          "libraries": [ "-L<!(pwd)/libpg_query/linux", "-lpg_query" ]
        }],
        ['OS=="mac"', {
          "libraries": [ "-L<!(pwd)/libpg_query/osx", "-lpg_query" ],
          "xcode_settings": {
            "CLANG_CXX_LIBRARY": "libc++",
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
            'MACOSX_DEPLOYMENT_TARGET': '10.7'
          }
        }],
        ['OS=="win"', {
          "msvs_settings": {
            "VCCLCompilerTool": {
              "ExceptionHandling": 1
            }
          }
        }]
      ]
    }
  ]
}
