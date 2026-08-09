import re
import sys

files = [
    "src/app/(auth)/login/page.tsx",
    "src/app/super-admin/page.tsx",
    "src/components/scheduler/UserSettingsDrawer.tsx",
    "src/components/scheduler/UserTaskScheduler.tsx",
    "src/components/tasks/CreateTaskModal.tsx",
    "src/components/ui/AddressAutocomplete.tsx",
    "src/context/auth-context.tsx",
    "src/hooks/bookings/useBookingForm.ts",
    "src/hooks/bookings/useBookingsList.ts",
    "src/hooks/dashboard/useActionCenterTasks.ts",
    "src/hooks/dashboard/useRecentActivity.ts",
    "src/hooks/dashboard/useUpcomingBookings.ts",
    "src/hooks/profile/useOperations.ts",
    "src/hooks/settings/useBusinessSettings.ts",
    "src/hooks/tasks/useTaskForm.ts",
    "src/hooks/tasks/useTasksList.ts",
    "src/hooks/useDashboard.ts",
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Find all catch blocks and fix them
    def fix_catch(match):
        # match.group(1) is the catch signature
        # match.group(2) is the body
        catch_sig = match.group(1)
        body = match.group(2)
        
        # If it's "} catch {" add (_error)
        if catch_sig.strip() == "} catch {":
            catch_sig = "} catch (_error) {"
            # Now rename 'error' to '_error' in the body
            body = re.sub(r'\berror\b', '_error', body)
        
        return catch_sig + body
    
    # Match catch blocks: from "catch" to the next "}" at the same indentation level
    # This is a simplified pattern - we'll just do "} catch {" -> "} catch (_error) {"
    content = re.sub(r'(\} catch \{)(.*?)(?=^\s*\}|\Z)', fix_catch, content, flags=re.MULTILINE | re.DOTALL)
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Fixed {filepath}")

