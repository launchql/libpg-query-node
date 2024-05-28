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
      'cflags!': ['-fno-exceptions', '-O3'],
      'cflags_cc!': ['-fno-exceptions', '-O3'],
      'include_dirs': [
        "libpg_query/include",
        "<!@(node -p \"require('node-addon-api').include\")",
        "<!(pkg-config --variable=includedir protobuf)"
      ],
      'dependencies': ["<!(node -p \"require('node-addon-api').gyp\")"],
      'conditions': [
        ['OS=="linux"', {
          "libraries": [
            "-L<!(pwd)/libpg_query/linux",
            "-lpg_query",
            "<!(pkg-config --variable=libdir protobuf)/libprotobuf.a"
          ],
          "actions": [
            {
              "outputs": ['libpg_query/include/pg_query.h'],
              "inputs": [],
              "action": ['script/buildAddon.sh'],
              "action_name": 'prebuild_dependencies'
            }
          ],
        }],
        ['OS=="mac"', {
          "libraries": [
            "-L<!(pwd)/libpg_query/osx",
            "-lpg_query",
            "<!(pkg-config --variable=libdir protobuf)/libprotobuf.a"
          ],
          "xcode_settings": {
            "CLANG_CXX_LIBRARY": "libc++",
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
            'MACOSX_DEPLOYMENT_TARGET': '10.7'
          },
          "actions": [
            {
              "outputs": ['libpg_query/include/pg_query.h'],
              "inputs": [],
              "action": ['script/buildAddon.sh'],
              "action_name": 'prebuild_dependencies'
            }
          ],
        }],
        ['OS=="win"', {
          "link_settings": {
            "library_dirs": [
              "../libpg_query/windows"
            ],
            "libraries": [
              "../libpg_query/windows/pg_query.lib"
            ],
          },
          "msvs_settings": {
            "VCCLCompilerTool": {
              "ExceptionHandling": 0,
              "AdditionalOptions": ["/EHsc"]
            }
          },
          "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ],
          "actions":[
            {
              "outputs": [
                ""
              ],
              "inputs": [],
              "action": ['../script/buildAddon.bat'],
              "action_name": 'prebuild_dependencies'
            }
          ]
        }]
      ]
    }
  ]
}
