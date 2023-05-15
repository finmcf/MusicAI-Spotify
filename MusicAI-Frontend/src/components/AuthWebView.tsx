import React from "react";
import { WebView } from "react-native-webview";

interface AuthWebViewProps {
  url: string;
  onNavigationStateChange: (navState: any) => void;
}

const AuthWebView: React.FC<AuthWebViewProps> = ({
  url,
  onNavigationStateChange,
}) => {
  return (
    <WebView
      source={{ uri: url }}
      onNavigationStateChange={onNavigationStateChange}
    />
  );
};

export default AuthWebView;
