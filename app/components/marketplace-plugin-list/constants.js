export default {
    instructions: `
    <ul class="bullet-list margin-r-1 margin-l-1h">
      <li class="margin-b-1">
        Generate a personal access token from <a href="/settings/developersettings" target="_blank">Developer Settings</a>
      </li>
      <li class="margin-b-1">
        Set environment variable <code class="black-text">APPKNOX_ACCESS_TOKEN</code> with the personal token:<br>
<pre class="code-block">
$ export APPKNOX_ACCESS_TOKEN=&lt;personal access token&gt;
</pre>
      </li>
      <li class="margin-b-1">
        Download the appknox binary:<br>
<pre class="code-block">
$ curl -L https://github.com/appknox/appknox-go/releases/download/1.0.1/appknox-\`uname -s\`-x86_64 &gt; /usr/local/bin/appknox && chmod +x /usr/local/bin/appknox
</pre>
      </li>
      <li class="margin-b-1">
        Upload the app file to Appknox platform for scanning:<br>
<pre class="code-block">
$ appknox upload &lt;path to apk/ipa file&gt;
</pre>
      </li>
      <li class="margin-b-1">
        Check if the automated scanner detected any vulnerability above (or equal to) the specified risk level:<br>
<pre class="code-block">
$ appknox cicheck &lt;file-id&gt; --risk_threshold &lt;low|medium|high|critical&gt;
</pre>
      </li>
      <li class="margin-b-2">
        Tip: You can combine the upload and cicheck command as below which will list down all the vulnerabilities equal to or above the specified risk threshold and will exit with an error status.<br>
<pre class="code-block">
$ appknox upload &lt;path to apk/ipa file&gt; | xargs appknox cicheck --risk-threshold &lt;low|medium|high|critical&gt;
</pre>
      </li>
    </ul>
  `
}
