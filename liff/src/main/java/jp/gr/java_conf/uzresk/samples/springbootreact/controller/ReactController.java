package jp.gr.java_conf.uzresk.samples.springbootreact.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ReactController {
    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }
}
