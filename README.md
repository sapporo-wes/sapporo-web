# SAPPORO-web

SAPPORO-service is a Web front-end for managing users and batch jobs.

[Japanese Document](https://hackmd.io/s/r1_mSHn8V)

## Usage

Use a script that wraps docker-compose.

```shell
./sapporo-web up
Start SAPPORO-web up...

  Debug              : False
  Port               : 1121
  Log Level          : INFO
  Timezone           : Asia/Tokyo
  Language Code      : en
  Enable User Signup : True

Creating sapporo-web-database ... done
Creating sapporo-web-app      ... done
Creating sapporo-web-web      ... done
Waiting for SAPPORO-web to start...

Please accsess in your brouwser:

    http://localhost:1121/

Finish SAPPORO-web up...
```

![SAPPORO - Home](https://i.imgur.com/ebHAY8o.jpg)

### Manage script

```shell
$ ./sapporo-web --help
sapporo-web is a set of management commands for SAPPORO-web.

Usage:
  sapporo-web up [-p <PORT>] [-l DEBUG|INFO] [-t <TIME_ZONE>] [--language-code <CODE>] [-d --debug] [--enable-user-signup] [-h]
  sapporo-web create-super-user
  sapporo-web down
  sapporo-web clean
  sapporo-web dev (up|create-super-user|down|clean|freeze|build|test) [-h]

Option:
  -h, --help                  Print usage.
  -v, --version               Print version.
```

### Manage User

There are two types of user: the general user and the administrator user. The difference is whether it can access the administration page.

The administrator user creates it as follows.

```shell
$ ./sapporo-web create-super-user
Start SAPPORO-web create suepr user...
Username: suecharo
Email address:
Password:
Password (again):
Superuser created successfully.
Finish SAPPORO-web create suepr user...
```

The general users create using Sign Up.

![SAPPORO - Signup](https://i.imgur.com/fsAoJc9.jpg)

If you want to disable Sign Up, start SAPPORO-web like `./sapporo-web up --disable-user-signup`.

To manage users, after logging in as an admin user, select [Admin] - [Managing users] in the header.

### Add SAPPORO-service

After logging in as an administrator user, select [Admin] - [Managing services] in the header.

![SAPPORO - Managing Service](https://i.imgur.com/IaEqRo1.png)

You can add SAPPORO-service by entering service information in the form.

If you are using SAPPORO-service on the same machine, `Service Server Host` is `sapporo-service-web:8080`.

## Run Workflow

Select [Workflow] - [Workflow Name to be executed] in the header.

![SAPPORO - Workflow](https://i.imgur.com/qKk1oxz.png)

When you select [Prepare Run], the form will be displayed, so please enter the execution parameters.

![SAPPORO - Prepare Workflow](https://i.imgur.com/MXW3cn3.png)

When you select [Run Workflow], the batch job starts.

![SAPPORO - Run](https://i.imgur.com/qlvyMbt.png)

### Network

SAPPORO-service is using Django. The network configuration is as follows.

```text
Django <-> uwsgi <-(uWSGI protocol)-> Nginx <-(HTTP)-> Docker <-> User
```

As an initial setting, Nginx provides `localhost:1121` as a Web endpoint. If you want to change the port, start SAPPORO-web like `./sapporo-web up --port ${PORT_NUM}`.

If you want to use SSL/TSL, edit `./etc/nginx/nginx.conf`.

### Logging

The following items are output as logs.

```shell
$ ls ./log
app  nginx
```

To change the log level, start SAPPORO-web like `./sapporo-web up --log-level DEBUG`. When set as `DEBUG`, detailed logs and traceback of Python are displayed in `./log/app/flask.log`.

If you want log rotation of `./log/django.log`, edit `./src/config/logging_config.py`.

## Stop and Uninstall

```shell
# Stop
$ ./sapporo-web down
# Uninstall
$ ./sapporo-web clean
```

## Development

### Build and Docker push

```shell
./sapporo-web dev freeze
./sapporo-web dev build ${VERSION}
docker push suecharo/sapporo-web:${VERSION}
```
