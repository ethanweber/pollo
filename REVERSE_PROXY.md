# Reverse Proxy Setup

Odds are you don't have a public IP address where you can use SSL/HTTPS to host your MTurk tasks. In this case, you can leverage a Google VM or publically accessible machine and following the instructions here to use a reverse proxy.

First you must create a VM and login to it. It should be accessible via a public IP address!

Next, install the nginx web server. I've included `sudo` in front of these commands due to default Google VM privileges.

```bash
sudo apt update
sudo apt install nginx
sudo unlink /etc/nginx/sites-enabled/default
```

Create the config file that we need to edit. Notice that the `chmod 777` command is so I can remote ssh with VS Code into the VM and make my changes there with full privileges to edit that file. :)

```bash
touch /etc/nginx/sites-available/reverse-proxy.conf
sudo chmod 777 /etc/nginx/sites-available/reverse-proxy.conf
sudo ln -s /etc/nginx/sites-available/reverse-proxy.conf /etc/nginx/sites-enabled/reverse-proxy.conf
```

Edit that file! Use `vim /etc/nginx/sites-available/reverse-proxy.conf`. Notice that `mturk.ethanweber.me` is the domain that I want to use when accessing the content at the port `8000`.

```text
server {
  server_name mturk.ethanweber.me;
  location / {
    proxy_pass http://127.0.0.1:8000/;
  }
}
```

Certbot is needed to setup the `mturk.ethanweber.me` domain. Install it with the following commands!

```bash
sudo apt-get update
sudo apt-get install software-properties-common
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install python3-certbot-nginx
```

Before proceeding, you need to setup an A Record that points the domain to your public VM IP address! I use Namecheap for this, but any domain provider should work. Follow the steps with the next command to get things working.

```bash
sudo certbot --nginx
```

You can verify that everything works by creating an html file and spinning up a server with python!

```
echo 'hello mturk world' >> index.html
python -m http.server 8000
```

If you can see the webpage, you are good to go. Now you can do something like ssh into a remote machine **from the VM** and forward a port **from the ssh'd machine to the VM**, which you can then see with HTTPS/SSL. Yay! Now go back to the other instructions to get your MTurk server running with `python server.py`. 😎

One last thing -- on your local machine, you likely need to add the following to your ssh config file so that you can ssh from your VM to your computer with the python server (probably your research cluster).

```text
Host *
  AddKeysToAgent yes
  UseKeychain yes
  ForwardAgent yes
```


# Resources

Most of these instructions come from [https://www.scaleway.com/en/docs/tutorials/nginx-reverse-proxy/](https://www.scaleway.com/en/docs/tutorials/nginx-reverse-proxy/).