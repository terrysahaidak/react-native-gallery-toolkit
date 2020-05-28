#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

@class RCTBridge; // <-add

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate>

@property (nonatomic, strong) UIWindow *window;

@property (nonatomic, readonly) RCTBridge *bridge; // <-add

@end
