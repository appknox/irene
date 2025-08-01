export default {
  instructions: `
    <ul class="marketplace-bullet-list mx-4">
      <li class="mb-2">
        Generate a personal access token from <a href="/dashboard/settings/developersettings" target="_blank">Developer Settings</a>
      </li>
      <li class="mb-2">
        Set environment variable <code class="marketplace-black-text">APPKNOX_ACCESS_TOKEN</code> with the personal token:<br>
<pre class="marketplace-code-block">
$ export APPKNOX_ACCESS_TOKEN=&lt;personal access token&gt;
</pre>
      </li>
      <li class="mb-2">
        Download the appknox binary:<br>
<pre class="marketplace-code-block">
$ curl -L https://github.com/appknox/appknox-go/releases/latest/download/appknox-\`uname -s\`-x86_64 &gt; /usr/local/bin/appknox && chmod +x /usr/local/bin/appknox
</pre>
      </li>
      <li class="mb-2">
        Upload the app file to Appknox platform for scanning:<br>
<pre class="marketplace-code-block">
$ appknox upload &lt;path to apk/ipa file&gt;
</pre>
      </li>
      <li class="mb-2">
        Check if the automated scanner detected any vulnerability above (or equal to) the specified risk level:<br>
<pre class="marketplace-code-block">
$ appknox cicheck &lt;file-id&gt; --risk_threshold &lt;low|medium|high|critical&gt;
</pre>
      </li>
      <li class="mb-2">
        Tip: You can combine the upload and cicheck command as below which will list down all the vulnerabilities equal to or above the specified risk threshold and will exit with an error status.<br>
<pre class="marketplace-code-block">
$ appknox upload &lt;path to apk/ipa file&gt; | xargs appknox cicheck --risk-threshold &lt;low|medium|high|critical&gt;
</pre>
      </li>
    </ul>
    <div class="mb-1">For more configuration options: <a href="https://github.com/appknox/appknox-go" target="_blank">github.com/appknox-go</a></div>
  `,
  appCenterInstructions: `
    <ol class="mx-4">
      <li class="mb-2">
        Generate a personal access token from <a href="/dashboard/settings/developersettings" target="_blank">Developer Settings</a>
      </li>
      <li class="mb-2">
        Create a file <code class="marketplace-black-text"><strong>appcenter-post-build.sh</strong></code> in your source code repository as per the <a href="https://docs.microsoft.com/en-us/appcenter/build/custom/scripts/#post-build" target="_blank">build docs</a> and add the content given below:
<pre class="marketplace-code-block">
  if [ "$AGENT_JOBSTATUS" == "Succeeded" ]; then
    if [ "$APPCENTER_BRANCH" == "master" ];
      then
          curl -L https://github.com/appknox/appknox-go/releases/latest/download/appknox-\`uname -s\`-x86_64 > appknox && chmod +x appknox
          ./appknox upload $APPCENTER_OUTPUT_DIRECTORY/&lt;binary_file_name&gt;
          rm appknox
    else
        echo "Current branch is $APPCENTER_BRANCH"
    fi
  fi
</pre>
        <small><code class="marketplace-black-text">binary_file_name</code> is the app bundle file (.apk for Android, .ipa for iOS)</small>
      </li>
      <li class="mb-2">
      Once the file has been added to repo, in App Center goto <strong>Build Configuration > Build > Build scripts</strong> and verify <strong>Post-build</strong> is marked.
        <img  class="mt-2" src="images/appcenter_build_configuration__build_script.png" alt="appcenter build config"/>
      </li>
      <li class="mb-2">
        Go to <strong>Build Configuration > Environment variables</strong> and add <code class="marketplace-black-text"><strong>APPKNOX_ACCESS_TOKEN</strong></code> environment variable with the value generated in step 1.
        <img class="mt-2" src="images/appcenter_build_configuration__environment.png" alt="appcenter environment config"/>
      </li>
    </ol>
  `,
  bitriseInstructions: `
    <ol class="mx-4">
      <li class="mb-2">
        Generate a personal access token from <a href="/dashboard/settings/developersettings" target="_blank">Developer Settings</a>
      </li>
      <li class="mb-2">
        In your project's Bitrise Workflow Editor, add secret environment variable <code class="marketplace-black-text"><strong>APPKNOX_ACCESS_TOKEN</strong></code> with the value generated in step 1.
        <img class="mt-2" src="images/bitrise_workflow__add_secret.png" alt="bitrise workflow editor: appknox secret"/>
      </li>
      <li class="mb-2">
        Add a <strong>script step</strong> as follows (either <a href="https://devcenter.bitrise.io/tips-and-tricks/install-additional-tools/#adding-a-script-step-to-a-workflow" target="_blank">from UI</a> or by editing <a href="https://devcenter.bitrise.io/tips-and-tricks/install-additional-tools/#advanced-option-use-deps-in-bitriseyml" target="_blank"><code>bitrise.yml</code></a> file).
        <em>Make sure this is included after the app binary build step in the workflow.</em> This would upload your APK/IPA file to appknox dashboard and initiate the static scan.
<pre class="marketplace-code-block">
- script:
  deps:
    brew:
    - name: curl
  inputs:
  - content: |-
      #!/usr/bin/env bash
      set -ex

      # upload to appknox
      curl -L https://github.com/appknox/appknox-go/releases/latest/download/appknox-\`uname -s\`-x86_64 > appknox && chmod +x appknox
      ./appknox upload $BITRISE_IPA_PATH
      rm ./appknox
</pre>
        <small>use <code class="marketplace-black-text">$BITRISE_APK_PATH</code> for Android</small>
        <img  class="mt-2" src="images/bitrise_workflow__script_step.png" alt="bitrise workflow editor: script step"/>
      </li>
    </ol>
    <hr class="my-1">
    <div>
      <em>Optional:</em> &nbsp;You can combine the upload and cicheck command as below which will list down all the vulnerabilities equal to or above the specified risk threshold in the workflow console and will exit with an error status.<br>
<pre class="marketplace-code-block">
$ appknox upload &lt;path to apk/ipa file&gt; | xargs appknox cicheck --risk-threshold &lt;low|medium|high|critical&gt;
</pre>
    </div>
  `,
  armorcodeInstructions: `
    <ol class="mx-4">
      <li class="mb-2">
        Generate a personal access token from <a href="/dashboard/settings/developersettings" target="_blank">Developer Settings</a> in the Appknox Dashboard.
      </li>
      <li class="mb-2">
        Log in to your ArmorCode dashboard and navigate to <strong>Manage > Security Tools > Appknox</strong>.
      </li>
      <li class="mb-2">
        Click <strong>Add Configuration</strong> and enter the following details:
        <ul style="list-style-type:disc" class="ml-4 mt-1">
          <li><strong>Configuration Name:</strong> Provide a unique name.</li>
          <li><strong>API Token:</strong> Paste the token generated in Step 1.</li>
        </ul>
      </li>
      <li class="mb-2">
        After saving the configuration, the system will prompt you to map your projects. Select:
        <ul style="list-style-type:disc" class="ml-4 mt-1">
          <li><strong>Organization</strong> from Appknox</li>
          <li><strong>Appknox Package</strong> you want to monitor</li>
          <li><strong>ArmorCode Product</strong>, <strong>Subproduct</strong>, and <strong>Environment</strong> to link the findings</li>
        </ul>
        Click <strong>Add Mapping</strong> to create multiple mappings if needed.
      </li>
      <li class="mb-2">
        Click <strong>Save</strong> to finalize your integration. Once a scan is complete in Appknox, findings will automatically sync and can be accessed by clicking the <strong>Scan ID</strong> or <strong>Result Details</strong> in ArmorCode.
      </li>
    </ol>
    <hr class="my-1">
    <div>
      <em>Optional:</em> You can also configure alerting and sync settings. For more, see <a href="https://support.armorcode.com/hc/en-us/articles/28507109043475-Configuring-Notifications-and-Settings-for-Security-Tools" target="_blank">ArmorCode Notification Settings</a>.
    </div>
  `,
};
