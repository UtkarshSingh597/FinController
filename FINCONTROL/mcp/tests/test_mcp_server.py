import json
from mcp.server import handle_json_rpc

def test_list_tools():
    req = {"jsonrpc": "2.0", "id": 1, "method": "tools/list"}
    res = handle_json_rpc(req)
    assert "result" in res
    assert "tools" in res["result"]
    tool_names = [t["name"] for t in res["result"]["tools"]]
    assert "get_financial_summary" in tool_names
    assert "analyze_payment_health" in tool_names

def test_call_tool():
    req = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": "get_financial_summary",
            "arguments": {"organization_id": "org_test"}
        }
    }
    res = handle_json_rpc(req)
    assert "result" in res
    content = json.loads(res["result"]["content"][0]["text"])
    assert content["organization_id"] == "org_test"
    assert content["evidence_tier"] == "FACT"

if __name__ == "__main__":
    test_list_tools()
    test_call_tool()
    print("All MCP Server unit tests passed successfully!")
