# Discovering connection models

In **Settings → Connections**, open a connection, enter its API key and optional
base URL, and choose **Fetch models**. Search or select entries in the returned
catalog, choose **Add selected models**, then save the connection. Existing model
IDs are retained. Fetching does not save the draft connection and does not send a
generation request.

Discovery currently supports OpenAI, OpenRouter, and local OpenAI-compatible
servers. Other providers retain manual model entry. The model catalog can contain
image, audio and embedding models as well as text models; discovery does not
guarantee compatibility with the application's chat protocol.

The main process performs a GET request through Electron's networking layer so
the request follows the default session's network settings. The default OpenAI
route is `https://api.openai.com/v1/models`, using the key in the Authorization
header. See the [OpenAI model-list reference](https://developers.openai.com/api/reference/resources/models/methods/list).
Custom base URLs preserve their API path; full chat, embeddings, responses and
models endpoints are normalized to their sibling `models` endpoint. Local
connections require a base URL and may omit authentication.

Requests time out after 15 seconds. Redirects are refused to avoid forwarding
credentials to another address. Only stable error codes are returned to the UI;
provider response bodies and transport messages are not logged or echoed, since
they can contain credentials. Editing the provider, URL or key invalidates the
pending UI request and clears its catalog. The selected model IDs are changed
only when the user explicitly adds or removes entries.
