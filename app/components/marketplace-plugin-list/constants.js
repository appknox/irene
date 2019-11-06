export default {
    instructions: `
    <ul class="bullet-list margin-h-1">
      <li class="margin-b-1">
        Get Personal Access Token from <a href="/settings/developersettings" target="_blank">Developer Settings</a>
      </li>
      <li class="margin-b-1">
        Download the appknox binary with following command:<br>
<pre class="code-block">
$ curl -L https://github.com/appknox/appknox-go/releases/download/1.0.1/appknox-\`uname -s\`-x86_64 &gt; /usr/local/bin/appknox && chmod +x /usr/local/bin/appknox
</pre>
      </li>
      <li class="margin-b-1">
        Set an environment variable <strong>APPKNOX_ACCESS_TOKEN</strong> with the personal token. For example:<br>
<pre class="code-block">
$ export APPKNOX_ACCESS_TOKEN=&lt;personal token&gt;
</pre>
      </li>
      <li class="margin-b-1">
        Use the following command to upload the respective file to Appknox. For example: For Android, applications do the below:<br>
<pre class="code-block">
$ appknox upload &lt;path to apk&gt;
</pre>
      </li>
      <li class="margin-b-1">
        To check if your file contains any vulnerabilities with the risk greater than or equal to when the static scan is completed after the file upload. Use following command. E.g.:<br>
<pre class="code-block">
$ appknox cicheck &lt;file-id&gt; --risk_threshold &lt;low|medium|high|critical&gt;
</pre>
      </li>
      <li class="margin-b-1">
        Tip: You can combine the upload and cicheck command as below which will list down all the vulnerabilities equal to or above the specified risk threshold and will exit with an error status.<br>
<pre class="code-block">
$ appknox upload &lt;path to apk&gt; | xargs appknox cicheck --risk-threshold &lt;low|medium|high|critical&gt;
</pre>
      </li>
    </ul>
  `
}