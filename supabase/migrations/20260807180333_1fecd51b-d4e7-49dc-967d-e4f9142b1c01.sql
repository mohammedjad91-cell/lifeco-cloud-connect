REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

REVOKE EXECUTE ON FUNCTION public.decrement_stock_on_issue() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.decrement_stock_on_issue() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stock_on_issue() TO service_role;