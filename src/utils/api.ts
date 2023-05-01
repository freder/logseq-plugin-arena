const apiUrl = 'http://api.are.na/v2';
export const perPage = 50;


export const getChannel = async (
	authToken: string,
	slug: String
) => {
	return fetch(
		`${apiUrl}/channels/${slug}?per=0`,
		{
			method: 'GET',
			headers: { 'X-AUTH-TOKEN': authToken },
		}
	).then((res) => res.json());
};


export const getChannelBlocks = async (
	authToken: string,
	channelId: number,
	page: number
) => {
	return fetch(
		`${apiUrl}/channels/${channelId}?per=${perPage}&page=${page}`,
		{
			method: 'GET',
			headers: { 'X-AUTH-TOKEN': authToken },
		}
	).then((res) => res.json());
};
