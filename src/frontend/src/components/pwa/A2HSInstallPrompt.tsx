import { useA2HS } from '../../hooks/useA2HS';
import { X, Download, Share } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export default function A2HSInstallPrompt() {
  const { shouldShowPrompt, isIOS, promptInstall, dismissPrompt } = useA2HS();

  if (!shouldShowPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 rounded-full bg-primary/10 p-2">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">Install BISAULI App</h3>
              {isIOS ? (
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>Install this app on your iPhone:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>
                      Tap the <Share className="inline h-3 w-3 mx-1" /> Share button below
                    </li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" to confirm</li>
                  </ol>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Get quick access and a better experience. Install BISAULI on your device for fast, app-like performance.
                </p>
              )}
              <div className="flex gap-2 mt-3">
                {!isIOS && (
                  <Button
                    size="sm"
                    onClick={promptInstall}
                    className="flex-1"
                  >
                    Install
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={dismissPrompt}
                  className="flex-1"
                >
                  Not now
                </Button>
              </div>
            </div>
            <button
              onClick={dismissPrompt}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
