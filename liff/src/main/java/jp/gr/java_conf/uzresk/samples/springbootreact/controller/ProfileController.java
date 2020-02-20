package jp.gr.java_conf.uzresk.samples.springbootreact.controller;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jp.gr.java_conf.uzresk.samples.springbootreact.model.Profile;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.Charset;
import java.util.Map;

@Slf4j
@RestController
@AllArgsConstructor
public class ProfileController {

    private static ObjectMapper mapper = new ObjectMapper();

    @GetMapping(value = "/api/profile")
    public String profile(@RequestHeader("accessToken") String accessToken) {

        if (!verifyToken(accessToken)) {
            return "error";
        }

        // LIFF SDKでprofileは一通り取得できるがaccessTokenから取得できることを確認してみる。
        Profile profile = getProfile(accessToken);

        return "{\"displayName\": \"" + profile.getDisplayName() + "\"}";
    }

    private boolean verifyToken(String accessToken) {
        HttpRequest request = HttpRequest.newBuilder(URI.create("https://api.line.me/oauth2/v2.1/verify?access_token=" + accessToken))
                .GET()
                .build();
        HttpResponse.BodyHandler<String> bh = HttpResponse.BodyHandlers.ofString(Charset.defaultCharset());
        String response = httpRequest(request, bh);
        Map<String, String> res;
        try {
            res = mapper.readValue(response, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        // TODO client_idがchannelidと同一であること
        String clientId = res.get("client_id");

        // 有効期限が0より大きいこと
        int expiresIn = Integer.parseInt(res.get("expires_in"));
        return expiresIn > 0;
    }

    private Profile getProfile(String accessToken) {
        HttpRequest request = HttpRequest.newBuilder(URI.create("https://api.line.me/v2/profile"))
                .GET()
                .setHeader("Authorization", "Bearer " + accessToken)
                .build();
        HttpResponse.BodyHandler<String> bh = HttpResponse.BodyHandlers.ofString(Charset.defaultCharset());
        String response = httpRequest(request, bh);
        try {
            return mapper.readValue(response, Profile.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private String httpRequest(HttpRequest request, HttpResponse.BodyHandler<String> bodyHandler) {
        HttpClient client = HttpClient.newHttpClient();
        String responseBody;
        try {
            HttpResponse<String> response = client.send(request, bodyHandler);
            responseBody = response.body();
            if (response.statusCode() != 200) {
                throw new RuntimeException("status code != 200." + responseBody);
            }
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException(e);
        }
        return responseBody;
    }

}
