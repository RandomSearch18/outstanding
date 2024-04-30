{pkgs}: {
  channel = "stable-23.11";
  packages = [
    pkgs.nodejs_20
    pkgs.corepack_20
  ];
  idx.extensions = [];
  idx.previews = {
    previews = [
      {
        command = [
          "yarn"
          "dev"
          "--"
          "--port"
          "$PORT"
          "--host"
          "0.0.0.0"
        ];
        id = "web";
        manager = "web";
      }
    ];
  };
}